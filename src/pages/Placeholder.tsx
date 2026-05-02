export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-400">{title}</h1>
        <p className="text-gray-500">Esta sección está en construcción.</p>
      </div>
    </div>
  );
}
