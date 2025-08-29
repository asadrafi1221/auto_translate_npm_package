import { useTranslation } from "@/libs/hooks"    // adjust your path;
import React from 'react'

function app() {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t("app")}</p>
      <p>{t("bye plz")}</p>
      <p>{t("cookies")}</p>
      <p>{t("bro what are you doing")}</p>
      <p>{t("ok vri")}</p>
      <p>{t("see ya")}</p>
    </div>
  )
}

export default app