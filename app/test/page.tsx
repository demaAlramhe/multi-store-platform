import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("stores").select("*");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>

      {error && (
        <div>
          <p>There is an error:</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {!error && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </main>
  );
}