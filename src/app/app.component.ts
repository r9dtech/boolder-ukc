import {Component, inject} from '@angular/core'
import {ClimbsComponent} from './climbs/climbs.component'
import {NgIf} from '@angular/common'
import {
	DataLookupResult,
	DataLookupServiceService,
} from './data-lookup-service.service'

@Component({
	selector: 'app-root',
	imports: [ClimbsComponent, NgIf],
	template: `
			<h1>boolder-ukc</h1>
			<h2>A tool to find Boolder climbs on ukc</h2>
			<p>
				<small
				>This is probably quite brittle - if UKC change things then it might
					stop working!</small
				>
			</p>
			<form (submit)="$event.preventDefault()">
				<label
				>Upload Boolder export:
					<input
						type="file"
						accept=".json,application/json"
						(change)="uploadFile($event)"
					/>
				</label>
			</form>
			<pre>{{
					fileParseStatus ??
					'Please upload a boolder export file - go to the app, export to onedrive/dropbox/whatever, then upload here'
				}}</pre>
			<h3>
				Finding this useful?
				<a target="_blank" href="https://buymeacoffee.com/r9dtech" rel="noreferrer">Buy me a coffee!</a>
			</h3>
			<climbs
				*ngIf="climbsByArea !== undefined"
				[climbsByArea]="climbsByArea"
			></climbs>
			<p>
				<small>
					Source on
					<a href="https://github.com/r9dtech/boolder-ukc?tab=readme-ov-file#boolder-ukc">GitHub...</a>
				</small>
			</p>
    `,
})
export class AppComponent {
	dataLookupServiceService = inject(DataLookupServiceService)

	fileParseStatus?: string
	climbsByArea?: DataLookupResult

	token?: symbol

	constructor() {
		console.log('hi')
	}

	uploadFile(event: Event) {
		this.fileParseStatus = 'Loading...'
		delete this.climbsByArea
		const element = event.currentTarget as HTMLInputElement
		const fileList: FileList | null = element.files
		if (fileList?.length === 1) {
			const token = Symbol('latest-file-upload')
			this.token = token
			const reader = new FileReader()
			reader.onload = async () => {
				if (token !== this.token) {
					return
				}
				try {
					const boolderData = await this.dataLookupServiceService.enrich(
						reader.result as string,
					)
					this.fileParseStatus = `Climbs loaded`
					this.climbsByArea = boolderData
				} catch (e: unknown) {
					this.fileParseStatus = `${e}`
				}
			}
			reader.readAsText(fileList[0])
		}
	}
}
