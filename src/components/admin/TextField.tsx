import {cn, tv} from "tailwind-variants";
import card from "@/components/admin/Card";

const textField = tv({
	base: cn(
		card(),
		"px-4 py-1 rounded-full focus:outline-none focus:border-hover transition-colors"
	)
})

export default textField