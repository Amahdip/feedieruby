// Minimal @salamruby/hub client stub for builds and environments without the full Hub SDK.

export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

export type FeedbackRecordFieldType =
  | "text"
  | "categorical"
  | "nps"
  | "csat"
  | "ces"
  | "rating"
  | "number"
  | "boolean"
  | "date";

export namespace FeedbackRecord {
  export type CreateParams = {
    field_id: string;
    field_type: FeedbackRecordFieldType;
    source_type: string;
    tenant_id: string;
    submission_id: string;
    collected_at?: string;
    source_id?: string | null;
    source_name?: string | null;
    field_label?: string | null;
    field_group_id?: string;
    field_group_label?: string | null;
    value_number?: number;
    value_text?: string | null;
    value_boolean?: boolean;
    value_date?: string;
    language?: string;
    user_id?: string;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export type Data = {
    id: string;
    tenant_id: string;
    submission_id: string;
    collected_at: string;
    created_at: string;
    updated_at: string;
    source_type: string;
    source_id?: string;
    source_name?: string;
    field_id: string;
    field_label?: string;
    field_type: FeedbackRecordFieldType;
    field_group_id?: string;
    field_group_label?: string;
    value_text?: string;
    value_number?: number;
    value_boolean?: boolean;
    value_date?: string;
    language?: string;
    user_id?: string;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export type ListParams = {
    tenant_id: string;
    limit?: number;
    cursor?: string;
    source_type?: string;
    field_type?: string;
    since?: string;
    until?: string;
    [key: string]: string | number | undefined;
  };

  export type ListResponse = {
    data: Data[];
    next_cursor?: string;
    total?: number;
    limit?: number;
    offset?: number;
  };
  export type UpdateParams = Partial<CreateParams>;
}

export namespace FeedbackRecords {
  export type SearchPerformSemanticSearchParams = {
    tenant_id: string;
    query: string;
    limit?: number;
    min_score?: number;
    [key: string]: string | number | undefined;
  };

  export type SearchPerformSemanticSearchResponse = {
    data: SearchPerformSemanticSearchResponse.Data[];
    limit?: number;
  };

  export namespace SearchPerformSemanticSearchResponse {
    export type Data = {
      feedback_record_id: string;
      score: number;
      field_label?: string;
      value_text?: string;
      [key: string]: unknown;
    };
  }
}

export type FeedbackRecordCreateParams = FeedbackRecord.CreateParams;
export type FeedbackRecordData = FeedbackRecord.Data;
export type FeedbackRecordListParams = FeedbackRecord.ListParams;
export type FeedbackRecordListResponse = FeedbackRecord.ListResponse;
export type FeedbackRecordUpdateParams = FeedbackRecord.UpdateParams;

export type SemanticSearchInput = FeedbackRecords.SearchPerformSemanticSearchParams;
export type SemanticSearchResponse = FeedbackRecords.SearchPerformSemanticSearchResponse;
export type SemanticSearchResultItem = FeedbackRecords.SearchPerformSemanticSearchResponse.Data;

const notConfigured = (): never => {
  throw new APIError("Hub client is not configured", 503);
};

const feedbackRecordsApi = {
  create: async (_input: FeedbackRecordCreateParams): Promise<FeedbackRecordData> => notConfigured(),
  retrieve: async (_id: string): Promise<FeedbackRecordData> => notConfigured(),
  update: async (_id: string, _input: FeedbackRecordUpdateParams): Promise<FeedbackRecordData> =>
    notConfigured(),
  delete: async (_id: string): Promise<void> => notConfigured(),
  list: async (_params: FeedbackRecordListParams): Promise<FeedbackRecordListResponse> => notConfigured(),
  search: {
    performSemanticSearch: async (
      _input: FeedbackRecords.SearchPerformSemanticSearchParams
    ): Promise<FeedbackRecords.SearchPerformSemanticSearchResponse> => notConfigured(),
  },
};

export class SalamRubyHub {
  static APIError = APIError;

  apiKey: string;
  baseURL: string;
  feedbackRecords = feedbackRecordsApi;

  constructor({ apiKey, baseURL }: { apiKey: string; baseURL: string }) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async get<T>(_path: string): Promise<T> {
    return notConfigured();
  }

  async post<T>(_path: string, _options?: { body?: unknown }): Promise<T> {
    return notConfigured();
  }

  async patch<T>(_path: string, _options?: { body?: unknown }): Promise<T> {
    return notConfigured();
  }

  async delete<T>(_path: string): Promise<T> {
    return notConfigured();
  }
}

export namespace SalamRubyHub {
  export type FeedbackRecordCreateParams = FeedbackRecord.CreateParams;
  export type FeedbackRecordData = FeedbackRecord.Data;
  export type FeedbackRecordListParams = FeedbackRecord.ListParams;
  export type FeedbackRecordListResponse = FeedbackRecord.ListResponse;
  export type FeedbackRecordUpdateParams = FeedbackRecord.UpdateParams;

  export namespace FeedbackRecords {
    export type SearchPerformSemanticSearchParams = {
      tenant_id: string;
      query: string;
      limit?: number;
      min_score?: number;
      [key: string]: string | number | undefined;
    };

    export type SearchPerformSemanticSearchResponse = {
      data: SearchPerformSemanticSearchResponse.Data[];
      limit?: number;
    };

    export namespace SearchPerformSemanticSearchResponse {
      export type Data = {
        feedback_record_id: string;
        score: number;
        field_label?: string;
        value_text?: string;
        [key: string]: unknown;
      };
    }
  }
}

export default SalamRubyHub;
