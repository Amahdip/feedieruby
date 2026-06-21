import {
  type JobHandlerOverrides,
  type JobsRuntimeHandle,
  type TResponsePipelineJobData,
  type TSurveySchedulingJobData,
  removeRecurringSurveySchedulingJobSchedule,
  startJobsRuntime,
  upsertRecurringSurveySchedulingJobSchedule,
} from "@salamruby/jobs";
import { logger } from "@salamruby/logger";
import { getJobsQueueingConfig, getJobsWorkerBootstrapConfig } from "@/lib/jobs/config";
import { processResponsePipelineJob } from "@/modules/response-pipeline/lib/process-response-pipeline-job";
import {
  SURVEY_SCHEDULING_DAILY_CRON_PATTERN,
  SURVEY_SCHEDULING_DAILY_SCHEDULE_ID,
  SURVEY_SCHEDULING_GLOBAL_SCOPE,
  SURVEY_SCHEDULING_TIME_ZONE,
} from "@/modules/survey/scheduling/lib/constants";
import { processSurveySchedulingJob } from "@/modules/survey/scheduling/lib/process-survey-scheduling-job";

const WORKER_STARTUP_RETRY_DELAY_MS = 30_000;

type TJobsRuntimeGlobal = typeof globalThis & {
  salamrubyJobsRecurringRegistration: Promise<void> | undefined;
  salamrubyJobsRecurringRegistered: boolean | undefined;
  salamrubyJobsRecurringRetryTimeout: ReturnType<typeof setTimeout> | undefined;
  salamrubyJobsRuntime: JobsRuntimeHandle | undefined;
  salamrubyJobsRuntimeInitializing: Promise<JobsRuntimeHandle> | undefined;
  salamrubyJobsRuntimeRetryTimeout: ReturnType<typeof setTimeout> | undefined;
};

const globalForJobsRuntime = globalThis as TJobsRuntimeGlobal;
const RESPONSE_PIPELINE_JOB_NAME = "response-pipeline.process";
const SURVEY_SCHEDULING_JOB_NAME = "survey-scheduling.reconcile";

const responsePipelineJobHandler: NonNullable<JobHandlerOverrides[string]> = async (data, context) => {
  await processResponsePipelineJob(data as TResponsePipelineJobData, context);
};
const surveySchedulingJobHandler: NonNullable<JobHandlerOverrides[string]> = async (data, context) => {
  await processSurveySchedulingJob(data as TSurveySchedulingJobData, context);
};

const registerSurveySchedulingSchedule = async (): Promise<void> => {
  await removeRecurringSurveySchedulingJobSchedule({
    scheduleId: SURVEY_SCHEDULING_DAILY_SCHEDULE_ID,
    scope: SURVEY_SCHEDULING_GLOBAL_SCOPE,
  });

  await upsertRecurringSurveySchedulingJobSchedule(
    {
      scheduleId: SURVEY_SCHEDULING_DAILY_SCHEDULE_ID,
      scope: SURVEY_SCHEDULING_GLOBAL_SCOPE,
    },
    {
      cronPattern: SURVEY_SCHEDULING_DAILY_CRON_PATTERN,
      kind: "cron",
      timeZone: SURVEY_SCHEDULING_TIME_ZONE,
    },
    {
      scope: SURVEY_SCHEDULING_GLOBAL_SCOPE,
    }
  );
};

const clearRecurringJobsRetryTimeout = (): void => {
  if (globalForJobsRuntime.salamrubyJobsRecurringRetryTimeout) {
    clearTimeout(globalForJobsRuntime.salamrubyJobsRecurringRetryTimeout);
    globalForJobsRuntime.salamrubyJobsRecurringRetryTimeout = undefined;
  }
};

const scheduleRecurringJobsRetry = (): void => {
  if (
    globalForJobsRuntime.salamrubyJobsRecurringRegistered ||
    globalForJobsRuntime.salamrubyJobsRecurringRegistration ||
    globalForJobsRuntime.salamrubyJobsRecurringRetryTimeout
  ) {
    return;
  }

  globalForJobsRuntime.salamrubyJobsRecurringRetryTimeout = setTimeout(() => {
    globalForJobsRuntime.salamrubyJobsRecurringRetryTimeout = undefined;
    void registerRecurringJobs().catch(() => undefined);
  }, WORKER_STARTUP_RETRY_DELAY_MS);

  logger.warn(
    { retryDelayMs: WORKER_STARTUP_RETRY_DELAY_MS },
    "BullMQ recurring job registration retry scheduled"
  );
};

const clearJobsWorkerRetryTimeout = (): void => {
  if (globalForJobsRuntime.salamrubyJobsRuntimeRetryTimeout) {
    clearTimeout(globalForJobsRuntime.salamrubyJobsRuntimeRetryTimeout);
    globalForJobsRuntime.salamrubyJobsRuntimeRetryTimeout = undefined;
  }
};

const scheduleJobsWorkerRetry = (): void => {
  if (
    globalForJobsRuntime.salamrubyJobsRuntime ||
    globalForJobsRuntime.salamrubyJobsRuntimeInitializing ||
    globalForJobsRuntime.salamrubyJobsRuntimeRetryTimeout
  ) {
    return;
  }

  globalForJobsRuntime.salamrubyJobsRuntimeRetryTimeout = setTimeout(() => {
    globalForJobsRuntime.salamrubyJobsRuntimeRetryTimeout = undefined;
    void registerJobsWorker().catch(() => undefined);
  }, WORKER_STARTUP_RETRY_DELAY_MS);

  logger.warn({ retryDelayMs: WORKER_STARTUP_RETRY_DELAY_MS }, "BullMQ worker registration retry scheduled");
};

export const registerRecurringJobs = async (): Promise<void> => {
  const jobsQueueingConfig = getJobsQueueingConfig();

  if (!jobsQueueingConfig.enabled || !jobsQueueingConfig.redisUrl) {
    clearRecurringJobsRetryTimeout();
    logger.debug("BullMQ recurring job registration skipped");
    return;
  }

  if (globalForJobsRuntime.salamrubyJobsRecurringRegistered) {
    return;
  }

  if (globalForJobsRuntime.salamrubyJobsRecurringRegistration) {
    return await globalForJobsRuntime.salamrubyJobsRecurringRegistration;
  }

  globalForJobsRuntime.salamrubyJobsRecurringRegistration = (async () => {
    await registerSurveySchedulingSchedule();
    clearRecurringJobsRetryTimeout();
    globalForJobsRuntime.salamrubyJobsRecurringRegistered = true;
    globalForJobsRuntime.salamrubyJobsRecurringRegistration = undefined;
  })();

  try {
    return await globalForJobsRuntime.salamrubyJobsRecurringRegistration;
  } catch (error) {
    globalForJobsRuntime.salamrubyJobsRecurringRegistration = undefined;
    logger.error({ err: error }, "BullMQ recurring job registration failed");
    scheduleRecurringJobsRetry();
    throw error;
  }
};

export const registerJobsWorker = async (): Promise<JobsRuntimeHandle | null> => {
  const jobsWorkerBootstrapConfig = getJobsWorkerBootstrapConfig();

  if (!jobsWorkerBootstrapConfig.enabled || !jobsWorkerBootstrapConfig.runtimeOptions) {
    clearJobsWorkerRetryTimeout();
    logger.debug("BullMQ worker startup skipped");
    return null;
  }

  if (globalForJobsRuntime.salamrubyJobsRuntime) {
    return globalForJobsRuntime.salamrubyJobsRuntime;
  }

  if (globalForJobsRuntime.salamrubyJobsRuntimeInitializing) {
    return await globalForJobsRuntime.salamrubyJobsRuntimeInitializing;
  }

  const runtimeOptions = jobsWorkerBootstrapConfig.runtimeOptions;
  const jobHandlerOverrides: JobHandlerOverrides = runtimeOptions.jobHandlerOverrides
    ? {
        ...runtimeOptions.jobHandlerOverrides,
        [RESPONSE_PIPELINE_JOB_NAME]: responsePipelineJobHandler,
        [SURVEY_SCHEDULING_JOB_NAME]: surveySchedulingJobHandler,
      }
    : {
        [RESPONSE_PIPELINE_JOB_NAME]: responsePipelineJobHandler,
        [SURVEY_SCHEDULING_JOB_NAME]: surveySchedulingJobHandler,
      };

  globalForJobsRuntime.salamrubyJobsRuntimeInitializing = (async () => {
    const runtime = await startJobsRuntime({
      ...runtimeOptions,
      jobHandlerOverrides,
    });

    clearJobsWorkerRetryTimeout();
    globalForJobsRuntime.salamrubyJobsRuntime = runtime;
    globalForJobsRuntime.salamrubyJobsRuntimeInitializing = undefined;
    return runtime;
  })();

  try {
    return await globalForJobsRuntime.salamrubyJobsRuntimeInitializing;
  } catch (error) {
    globalForJobsRuntime.salamrubyJobsRuntimeInitializing = undefined;
    logger.error({ err: error }, "BullMQ worker registration failed");
    scheduleJobsWorkerRetry();
    throw error;
  }
};

export const resetJobsWorkerRegistrationForTests = async (): Promise<void> => {
  const runtime = globalForJobsRuntime.salamrubyJobsRuntime;
  const initializing = globalForJobsRuntime.salamrubyJobsRuntimeInitializing;
  clearRecurringJobsRetryTimeout();
  clearJobsWorkerRetryTimeout();
  globalForJobsRuntime.salamrubyJobsRecurringRegistered = undefined;
  globalForJobsRuntime.salamrubyJobsRecurringRegistration = undefined;
  globalForJobsRuntime.salamrubyJobsRuntime = undefined;
  globalForJobsRuntime.salamrubyJobsRuntimeInitializing = undefined;

  const runtimesToClose = new Set<JobsRuntimeHandle>();

  if (runtime) {
    runtimesToClose.add(runtime);
  }

  if (initializing) {
    try {
      const initializedRuntime = await initializing;
      runtimesToClose.add(initializedRuntime);
    } catch {
      // Startup failures are already surfaced by the test that triggered them.
    }
  }

  if (globalForJobsRuntime.salamrubyJobsRuntime) {
    runtimesToClose.add(globalForJobsRuntime.salamrubyJobsRuntime);
  }

  globalForJobsRuntime.salamrubyJobsRuntime = undefined;
  globalForJobsRuntime.salamrubyJobsRuntimeInitializing = undefined;

  await Promise.all(
    [...runtimesToClose].map(async (runtimeHandle) => {
      try {
        await runtimeHandle.close();
      } catch (error) {
        logger.error({ err: error }, "BullMQ worker test reset close failed");
      }
    })
  );
};
