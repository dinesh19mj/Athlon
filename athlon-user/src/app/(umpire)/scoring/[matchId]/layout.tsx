export default function UmpireScoringLayout({ children }: { children: React.ReactNode }) {
  return (
    // Force a full viewport height, dark mode background, no overflow if possible, disable pull-to-refresh
    <div className="fixed inset-0 bg-(--bg) text-(--text) overflow-hidden overscroll-none touch-none">
      {children}
    </div>
  );
}
