// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password, loginType } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // ✅ Next 15 requires await
    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    // 1) Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const authUser = data.user as any;

    // 2) Pull role/permissions
    const userMeta = (authUser.user_metadata || {}) as any;
    const appMeta = (authUser.app_metadata || {}) as any;

    const role = userMeta.role || appMeta.role || "user";
    const permissions = userMeta.permissions || appMeta.permissions || [];

    // 3) If client, load client_users + clients
    let clientUser: any = null;
    let client: any = null;

    const isClient = role === "client" || loginType === "client";

    if (isClient) {
      const { data: cu, error: cuError } = await supabase
        .from("client_users")
        .select("id, client_id, email, full_name, role, auth_user_id")
        .eq("auth_user_id", authUser.id) // ✅ FIXED
        .maybeSingle();

      if (!cuError && cu) {
        clientUser = cu;

        if (cu.client_id) {
          const { data: c, error: cError } = await supabase
            .from("clients")
            .select(
              "id, company_name, contact_email, primary_color, logo_url, subdomain, is_active"
            )
            .eq("id", cu.client_id)
            .maybeSingle();

          if (!cError && c) client = c;
        }
      }

      // ✅ Guard: no linked row
      if (!clientUser || !clientUser.client_id) {
        return NextResponse.json(
          {
            error: "Client profile not linked. Please contact support.",
          },
          { status: 403 }
        );
      }
    }

    // 4) Build safe user payload
    const userPayload = {
      id: authUser.id,
      email: authUser.email,
      role,
      permissions,
      full_name: userMeta.full_name || clientUser?.full_name || null,
      client: client
        ? {
            id: client.id,
            company_name: client.company_name,
            contact_email: client.contact_email,
            primary_color: client.primary_color || "#0066CC",
            logo_url: client.logo_url || null,
            subdomain: client.subdomain || null,
            is_active: client.is_active ?? true,
          }
        : null,
      meta: userMeta,
      app_metadata: appMeta,
    };

    return NextResponse.json(
      { success: true, user: userPayload, session: data.session },
      { status: 200 }
    );
  } catch (err) {
    console.error("🚨 /api/auth/login unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong during login" },
      { status: 500 }
    );
  }
}
