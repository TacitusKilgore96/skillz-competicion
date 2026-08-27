import { tv } from "tailwind-variants";

const textField = tv({
	base: "w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-slate-800 bg-white transition-colors text-sm placeholder:text-slate-400",
});

export default textField;
