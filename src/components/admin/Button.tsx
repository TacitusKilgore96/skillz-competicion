import {cn, tv} from "tailwind-variants";
import card from "@/components/admin/Card";

export const button = tv({
	base: "transition-colors cursor-pointer",
	variants: {
		shape: {
			pill: cn(card(), "rounded-full px-4 py-1 hover:border-hover"),
			link: cn("hover:underline")
		}
	},
	defaultVariants: {
		shape: "pill"
	}
})

export const iconButton = tv({
	base: cn(
		button.base,
		"p-2 size-fit"
	),
	variants: {
		shape: {
			pill: cn(button.variants.shape.pill, "p-2")
		}
	},
	defaultVariants: {
		shape: "pill"
	}
})