import apiClient from "@/lib/apiClient";

export type FeatureAction = "menu_click" | "menu_open" | "cta_accept" | "cta_dismiss";

export async function trackFeatureInterest(feature: string, action: FeatureAction, extra?: Record<string, unknown>) {
  try {
    await apiClient.request("/api/feature-interest", {
      method: "POST",
      body: { feature, action, extra },
      withAuth: true,
    });
  } catch {}
}

