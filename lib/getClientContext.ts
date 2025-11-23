// lib/getClientContext.ts
import { createClient } from "@/lib/supabase/server";

export async function getClientContext() {
  const supabase = createClient();

  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (!auth?.user || authError) return null;

  const { data: clientUser, error: clientError } = await supabase
    .from("client_users")
    .select(`
      id, role, client_id, full_name, email,
      clients(company_name, primary_color, logo_url)
    `)
    .eq("auth_user_id", auth.user.id)
    .maybeSingle();

  if (clientError || !clientUser) return null;

  return {
    user: clientUser,
    client: clientUser.clients,
    client_id: clientUser.client_id,
  };
}
