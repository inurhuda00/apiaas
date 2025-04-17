import { Fragment, Suspense } from "react";
import Navigation from "../../_components/navigations";
import { SettingsGeneralForm } from "../_components/form-settings-general";

export default function GeneralPage() {
	return (
		<Fragment>
			<h1 className="text-lg lg:text-2xl font-medium text-primary mb-6">General Settings</h1>
			<div className="md:flex items-start gap-6 grid">
				<Navigation />
				<Suspense>
					<SettingsGeneralForm />
				</Suspense>
			</div>
		</Fragment>
	);
}
