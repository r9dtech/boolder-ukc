import {Component, Input} from '@angular/core'
import {NgForOf} from '@angular/common'
import {DataLookupResult} from '../data-lookup-service.service'

@Component({
	selector: 'climbs',
	imports: [NgForOf],
	template: `
			<table>
				<ng-container *ngFor="let area of climbsByArea">
					<thead>
					<tr>
						<th>{{ area.areaName }}</th>
					</tr>
					</thead>
					<tbody>
					<tr *ngFor="let climb of area.climbs">
						<td>{{ climb.circuitColor }} {{ climb.circuitNumber }}</td>
						<td>{{ climb.climbName }}</td>
						<td>{{ climb.grade }}</td>
					</tr>
					</tbody>
				</ng-container>
			</table>
    `,
})
export class ClimbsComponent {
	@Input({required: true}) climbsByArea!: DataLookupResult
}
