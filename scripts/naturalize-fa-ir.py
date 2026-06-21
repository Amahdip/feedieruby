#!/usr/bin/env python3
"""Improve fa-IR locale strings for natural, native Persian."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

LOCALE_PATH = Path(__file__).resolve().parents[1] / "apps/web/locales/fa-IR.json"

# Longer phrases first to avoid partial replacement issues.
PHRASE_REPLACEMENTS: list[tuple[str, str]] = [
    ("سالامروبی", "فیدی‌روبی"),
    ("سلام‌روبی", "فیدی‌روبی"),
    ("Formbricks", "FeedieRuby"),
    ("formbricks", "feedieruby"),
    ("تجزیه و تحلیل", "تحلیل"),
    ("صندوق ورودی", "صندوق دریافت"),
    ("کلیپ بورد", "کلیپ‌بورد"),
    ("معین مرکزی", "پنجرهٔ وسط‌چین"),
    ("ژتون", "توکن"),
    ("نشانه ای", "توکن"),
    ("هیچ نشانه ای", "توکن ارسال نشده"),
    ("فضای کاری", "میزکار"),
    ("فضاهای کاری", "میزکارها"),
    ("حساب کاربری", "حساب"),
    ("وارد حساب کاربری خود شوید", "ورود به حساب"),
    ("وارد حساب خود شوید", "ورود به حساب"),
    ("یک حساب کاربری ایجاد کنید", "ثبت‌نام"),
    ("رمز عبور خود را فراموش کرده اید؟", "رمز عبور را فراموش کرده‌اید؟"),
    ("از سیستم خارج خواهید شد", "از حساب خارج می‌شوید"),
    ("از سیستم خارج شوید", "خروج"),
    ("با ایمیل وارد شوید", "ورود با ایمیل"),
    ("با ایمیل ادامه دهید", "ورود با ایمیل"),
    ("با گوگل ادامه دهید", "ورود با Google"),
    ("با GitHub ادامه دهید", "ورود با GitHub"),
    ("با مایکروسافت ادامه دهید", "ورود با Microsoft"),
    ("با OpenID ادامه دهید", "ورود با OpenID"),
    ("با SAML SSO ادامه دهید", "ورود با SAML SSO"),
    ("با {oidcDisplayName} ادامه دهید", "ورود با {oidcDisplayName}"),
    ("به برنامه بروید", "ورود به برنامه"),
    ("از ارائه بازخوردتان متشکریم - برویم!", "ممنون که وقت گذاشتید. آماده‌اید شروع کنیم؟"),
    ("ما از بازخورد شما قدردانی می کنیم.", "از بازخورد شما سپاسگزاریم."),
    ("نظرسنجی خود را ایجاد کنید", "ساخت نظرسنجی"),
    ("پاسخ خود را اینجا تایپ کنید…", "پاسخ خود را اینجا بنویسید…"),
    ("پاسخ خود را اینجا تایپ کنید...", "پاسخ خود را اینجا بنویسید…"),
    ("Single-sect", "تک‌گزینه‌ای"),
    ("به روز رسانی", "به‌روزرسانی"),
    ("به روز", "به‌روز"),
    ("پیش فرض", "پیش‌فرض"),
    ("پیش نمایش", "پیش‌نمایش"),
    ("غیر فعال", "غیرفعال"),
    ("نظرسنجی ها", "نظرسنجی‌ها"),
    ("پاسخ ها", "پاسخ‌ها"),
    ("ستون ها", "ستون‌ها"),
    ("پیگیری ها", "پیگیری‌ها"),
    ("دعوتنامه ها", "دعوتنامه‌ها"),
    ("ایمیل های", "ایمیل‌های"),
    ("هم تیمی", "هم‌تیمی"),
    ("وب سایت", "وب‌سایت"),
    ("جاوا اسکریپت", "JavaScript"),
    ("لطفا ", "لطفاً "),
    ("تایید", "تأیید"),
    ("نمی توان", "نمی‌توان"),
    ("نمی شود", "نمی‌شود"),
    ("می شود", "می‌شود"),
    ("می توانید", "می‌توانید"),
    ("می خواهید", "می‌خواهید"),
    ("می بینید", "می‌بینید"),
    ("می یابد", "می‌یابد"),
    ("می رسد", "می‌رسد"),
    ("شده است", "شده است"),
    ("استفاده می شود", "استفاده می‌شود"),
    ("راه اندازی", "راه‌اندازی"),
    ("پس زمینه", "پس‌زمینه"),
    ("ماشه", "ماشه"),
    ("برداشت", "بازدید"),
    ("متن رایگان", "متن آزاد"),
    ("تک انتخاب کنید", "تک‌گزینه‌ای"),
    ("چند انتخاب کنید", "چندگزینه‌ای"),
    ("اضافه کردن بلوک", "افزودن سؤال"),
    ("در Block خود", "در این بخش"),
    ("Block خود", "این بخش"),
    ("بلوک", "بخش"),
    ("را اضافه کنید", " را اضافه کنید"),
]

# Short button labels — only apply when the entire string matches or ends with these patterns.
BUTTON_REPLACEMENTS: dict[str, str] = {
    "لغو کنید": "لغو",
    "تأیید کنید": "تأیید",
    "تایید کنید": "تأیید",
    "ذخیره کنید": "ذخیره",
    "ویرایش کنید": "ویرایش",
    "حذف کنید": "حذف",
    "دانلود کنید": "دانلود",
    "کپی کنید": "کپی",
    "ادامه دهید": "ادامه",
    "اضافه کنید": "افزودن",
    "فیلتر کنید": "فیلتر",
    "مدیریت کنید": "مدیریت",
    "دعوت کنید": "دعوت",
    "بیشتر بارگیری کنید": "بارگذاری بیشتر",
}

PATH_OVERRIDES: dict[str, str] = {
    "auth.login.login_to_your_account": "ورود به حساب",
    "auth.login.create_an_account": "ثبت‌نام",
    "auth.login.forgot_your_password": "رمز عبور را فراموش کرده‌اید؟",
    "auth.login.new_to_salamruby": "تازه‌وارد فیدی‌روبی هستید؟",
    "auth.login.lost_access": "دسترسی را از دست داده‌اید؟",
    "auth.login.oauth_account_not_linked_title": "این ورود SSO به حسابی وصل نشد",
    "auth.login.oauth_account_not_linked_description": (
        "این روش ورود به هیچ حساب فیدی‌روبی متصل نیست. با همان روشی وارد شوید که اول ثبت‌نام کرده‌اید. "
        "اگر با ایمیل ثبت‌نام کرده‌اید، در صورت نیاز ابتدا ایمیلتان را تأیید کنید."
    ),
    "auth.invite.happy_to_have_you": "خوشحالیم که پیوستید",
    "auth.invite.happy_to_have_you_description": "برای ادامه ثبت‌نام کنید یا وارد شوید.",
    "auth.invite.email_does_not_match": "ایمیل با دعوت‌نامه یکی نیست",
    "auth.invite.email_does_not_match_description": "ایمیل دعوت‌نامه با ایمیل شما مطابقت ندارد.",
    "auth.invite.go_to_app": "ورود به برنامه",
    "auth.invite.welcome_to_organization_description": "به سازمان خوش آمدید.",
    "auth.invite.login": "ورود",
    "auth.signup.title": "ساخت حساب فیدی‌روبی",
    "auth.signup.have_an_account": "حساب دارید؟",
    "auth.signup.log_in": "ورود",
    "auth.signup.product_updates_title": "ایمیل‌های به‌روزرسانی ماهانه محصول",
    "auth.signup.product_updates_description": (
        "مایل به دریافت ایمیل‌های ماهانهٔ به‌روزرسانی محصول از فیدی‌روبی هستم. سیاست حفظ حریم خصوصی اعمال می‌شود."
    ),
    "auth.signup.security_updates_title": "به‌روزرسانی‌های امنیتی",
    "auth.forgot-password.email-sent.heading": "درخواست بازیابی رمز عبور ثبت شد",
    "auth.forgot-password.email-sent.text": (
        "اگر حسابی با این ایمیل وجود داشته باشد، به‌زودی راهنمای بازیابی رمز عبور را دریافت می‌کنید."
    ),
    "auth.forgot-password.reset.success.text": "اکنون می‌توانید با رمز جدید وارد شوید.",
    "auth.email-change.confirm_password_description": "قبل از تغییر ایمیل، رمز عبور را تأیید کنید.",
    "auth.email-change.email_change_success_description": "ایمیلتان با موفقیت تغییر کرد. با ایمیل جدید وارد شوید.",
    "templates.default_welcome_card_headline": "خوش آمدید!",
    "templates.default_welcome_card_html": "از اینکه وقت گذاشتید ممنونیم. آماده‌اید شروع کنیم؟",
    "templates.default_welcome_card_button_label": "شروع",
    "templates.default_ending_card_headline": "سپاسگزاریم",
    "templates.default_ending_card_subheader": "از بازخورد شما متشکریم.",
    "templates.default_ending_card_button_label": "ساخت نظرسنجی",
    "common.welcome_card": "کارت خوش‌آمد",
    "common.next": "بعدی",
    "common.back": "بازگشت",
    "common.cancel": "لغو",
    "common.confirm": "تأیید",
    "common.save": "ذخیره",
    "common.delete": "حذف",
    "common.edit": "ویرایش",
    "common.create": "ایجاد",
    "common.continue": "ادامه",
    "common.close": "بستن",
    "common.loading": "در حال بارگذاری…",
    "common.error": "خطا",
    "common.are_you_sure": "مطمئن هستید؟",
    "common.logout": "خروج",
    "common.learn_more": "اطلاعات بیشتر",
    "common.note": "توجه",
    "common.on": "روشن",
    "common.off": "خاموش",
    "common.shown": "نمایش داده می‌شود",
    "common.hidden": "پنهان",
    "common.time_to_finish": "زمان تقریبی",
    "common.show_response_count": "نمایش تعداد پاسخ‌ها",
    "common.copied_to_clipboard": "در کلیپ‌بورد کپی شد",
    "common.connect_salamruby": "اتصال به فیدی‌روبی",
    "common.app_version": "نسخهٔ فیدی‌روبی",
    "common.javascript_required_description": (
        "برای کارکرد درست فیدی‌روبی، JavaScript را در مرورگر فعال کنید."
    ),
    "common.mobile_overlay_title": "صفحه‌نمایش کوچک شناسایی شد",
    "common.mobile_overlay_app_works_best_on_desktop": (
        "فیدی‌روبی روی صفحهٔ بزرگ‌تر راحت‌تر است. برای ساخت یا مدیریت نظرسنجی از رایانه استفاده کنید."
    ),
    "common.mobile_overlay_surveys_look_good": (
        "نگران نباشید — نظرسنجی‌هایتان روی هر دستگاهی خوب دیده می‌شوند."
    ),
    "common.impressions": "بازدید",
    "common.imprint": "اطلاعات قانونی",
    "common.dismissed": "رد شده",
    "common.hidden_field": "فیلد پنهان",
    "common.hidden_fields": "فیلدهای پنهان",
    "common.analysis": "تحلیل",
    "common.workspace": "میزکار",
    "common.workspaces": "میزکارها",
    "common.create_workspace": "ایجاد میزکار",
    "common.add_workspace": "افزودن میزکار",
    "common.change_workspace": "تغییر میزکار",
    "common.choose_workspace": "انتخاب میزکار",
    "common.add_new_workspace": "افزودن میزکار جدید",
    "common.link_survey": "نظرسنجی لینکی",
    "common.app_survey": "نظرسنجی درون‌برنامه‌ای",
    "common.add": "افزودن",
    "common.powered_by_salamruby": "قدرت‌گرفته از فیدی‌روبی",
    "setup.signup.title": "راه‌اندازی فیدی‌روبی",
    "workspace.surveys.edit.welcome_message": "پیام خوش‌آمد",
    "workspace.surveys.edit.company_logo": "لوگوی سازمان",
    "workspace.surveys.edit.next_button_label": "برچسب دکمه «بعدی»",
    "workspace.surveys.edit.connect_salamruby_and_launch_surveys": (
        "سلام‌روبی را متصل کنید و نظرسنجی‌ها را در وب‌سایت یا برنامهٔ خود اجرا کنید."
    ),
    "workspace.surveys.edit.confirm_default_language": "تأیید زبان پیش‌فرض",
    "workspace.surveys.edit.default_language": "زبان پیش‌فرض",
    "workspace.surveys.edit.expand_preview": "بزرگ‌نمایی پیش‌نمایش",
    "workspace.surveys.edit.end_screen_card": "کارت پایان",
    "common.ask": "نظرسنجی",
    "common.questions": "سؤالات",
    "common.surveys": "نظرسنجی‌ها",
    "common.settings": "تنظیمات",
    "common.contacts": "مخاطبان",
    "common.create_survey": "ساخت نظرسنجی",
    "common.styling": "ظاهر",
    "common.language": "زبان",
    "common.publish": "انتشار",
    "common.draft": "پیش‌نویس",
    "templates.free_text": "متن آزاد",
    "templates.free_text_description": "پاسخ متنی آزاد بگیرید",
    "templates.single_select": "تک‌گزینه‌ای",
    "templates.single_select_description": "لیست گزینه‌ها — یک مورد انتخاب شود",
    "templates.multi_select": "چندگزینه‌ای",
    "templates.multi_select_description": "لیست گزینه‌ها — چند مورد انتخاب شود",
    "workspace.surveys.edit.add_block": "افزودن سؤال",
    "workspace.surveys.edit.choose_the_first_question_on_your_block": "اولین سؤال این بخش را انتخاب کنید",
    "workspace.surveys.edit.default_draft_question_headline": "سؤال خود را بنویسید",
    "workspace.surveys.edit.ending_card": "کارت پایان",
}
def set_by_path(obj: dict, path: str, value: str) -> None:
    parts = path.split(".")
    cur = obj
    for part in parts[:-1]:
        cur = cur[part]
    cur[parts[-1]] = value


def naturalize_string(value: str) -> str:
    if not value or not isinstance(value, str):
        return value

    out = value
    for old, new in PHRASE_REPLACEMENTS:
        out = out.replace(old, new)

    stripped = out.strip()
    if stripped in BUTTON_REPLACEMENTS:
        return BUTTON_REPLACEMENTS[stripped]

    # Fix artifacts from partial matches on already-correct strings.
    out = out.replace("لطفاًً", "لطفاً")
    out = re.sub(r"(?<![\u0600-\u06FF])لطفا(?![\u0600-\u06FF])", "لطفاً", out)

    return out


def walk(obj):
    if isinstance(obj, dict):
        return {k: walk(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [walk(v) for v in obj]
    if isinstance(obj, str):
        return naturalize_string(obj)
    return obj


def main() -> int:
    path = LOCALE_PATH
    with path.open(encoding="utf-8") as f:
        data = json.load(f)

    data = walk(data)

    for dot_path, text in PATH_OVERRIDES.items():
        try:
            set_by_path(data, dot_path, text)
        except KeyError:
            print(f"warning: missing path {dot_path}", file=sys.stderr)

    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    content = path.read_text(encoding="utf-8")
    assert "سالامروبی" not in content, "brand replacement incomplete"
    json.loads(content)
    print(f"Naturalized {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
