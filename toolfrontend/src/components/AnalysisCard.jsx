export default function AnalysisCard({ title, children }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {children}
    </div>
  );
}