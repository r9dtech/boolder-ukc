import {Component, Input} from '@angular/core'
import {BoolderExport} from '../../../lib/boolder.mjs'
import {NgForOf} from '@angular/common'

@Component({
	selector: 'climbs',
	imports: [NgForOf],
	template: `
		<table>
			<tbody>
				<tr *ngFor="let tick of boolderData.ticks">
					<td>{{ tick.id }}</td>
				</tr>
			</tbody>
		</table>
	`,
})
export class ClimbsComponent {
	@Input({required: true}) boolderData!: BoolderExport
}
