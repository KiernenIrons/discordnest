export function ServerCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col">
      <div className="h-28 skeleton" />
      <div className="pt-8 px-4 pb-4 flex flex-col gap-3">
        <div className="h-5 skeleton w-2/3" />
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-3/4" />
        <div className="flex gap-2">
          <div className="h-5 w-16 skeleton rounded-full" />
          <div className="h-5 w-14 skeleton rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-1">
          <div className="h-4 w-20 skeleton" />
          <div className="h-8 w-16 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}
