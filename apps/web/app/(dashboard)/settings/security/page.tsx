import { Fragment, Suspense } from "react";

import Navigation from "../../_components/navigations";
import { SettingPasswordForm, SettingsDeleteForm } from "../_components/form-settings-security";

export default function SecurityPage() {
	return (
		<Fragment>
			<h1 className="text-lg lg:text-2xl font-medium text-primary mb-6">Security Settings</h1>
			<div className="md:flex items-start gap-6 grid">
				<Navigation />
				<main className="grid gap-6 flex-1">
					<Suspense>
						<SettingPasswordForm />
					</Suspense>

					<Suspense>
						<SettingsDeleteForm />
					</Suspense>
				</main>
			</div>
		</Fragment>
	);
}
