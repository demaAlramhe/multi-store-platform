function StatusBadge({ status }: { status: string | null }) {
  const styles =
    status === "active"
      ? { backgroundColor: "#dcfce7", color: "#166534" }
      : status === "inactive"
      ? { backgroundColor: "#fee2e2", color: "#991b1b" }
      : { backgroundColor: "#e5e7eb", color: "#374151" };

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={styles}
    >
      {status ?? "unknown"}
    </span>
  );
}