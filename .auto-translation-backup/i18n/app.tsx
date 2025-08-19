import { useTranslation } from "@/libs/hooks";
import React from "react";

function app() {
  const { t } = useTranslation();
  return (
    <div>
      <p>filters is here</p>
      <p>{t("heo")}</p>
    </div>
  );
}

export default app;
