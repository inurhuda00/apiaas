import { Fragment } from "react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { UploadImageForm } from "../_components/form-upload-image";

export default function UploadPage() {
	return (
		<Fragment>
			<main>
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
					<h1 className="text-lg lg:text-2xl font-medium text-primary">
						File Upload
					</h1>
					<Link href="/files" className={buttonVariants()}>
						My Assets
					</Link>
				</div>
				<UploadImageForm />
			</main>
		</Fragment>
	);
}
