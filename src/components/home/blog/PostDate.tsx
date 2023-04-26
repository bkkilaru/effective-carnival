import { format, parseISO } from "date-fns";

export default function PostDate({ timeString }: { timeString: string }) {
  return (
    <span className="text-gray-400">
      {format(parseISO(timeString), "d MMMM yyyy")}
    </span>
  );
}
