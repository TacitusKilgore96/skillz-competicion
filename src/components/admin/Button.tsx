import { tv } from "tailwind-variants";

export const button = tv({
	base: "transition-colors cursor-pointer text-sm font-medium inline-flex items-center justify-center gap-1.5",
	variants: {
		shape: {
			pill: "rounded-lg px-3.5 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
			link: "hover:underline text-slate-700 p-0 border-none bg-transparent",
		},
	},
	defaultVariants: {
		shape: "pill",
	},
});

export const iconButton = tv({
	base: "transition-colors cursor-pointer rounded-lg p-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 inline-flex items-center justify-center",
	variants: {
		shape: {
			pill: "rounded-lg p-2",
		},
	},
	defaultVariants: {
		shape: "pill",
	},
});
