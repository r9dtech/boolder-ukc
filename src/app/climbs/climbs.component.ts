import {Component, Input} from '@angular/core'
import {NgForOf, NgIf, TitleCasePipe} from '@angular/common'
import {DataLookupResult} from '../data-lookup-service.service'

@Component({
	selector: 'climbs',
	imports: [NgForOf, TitleCasePipe, NgIf],
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
					<td>
						{{ climb.circuitColor | titlecase }} {{ climb.circuitNumber }}
					</td>
					<td>{{ climb.climbName }}</td>
					<td>{{ climb.grade }}</td>
					<td>
						<ul>
							<li *ngFor="let link of climb.links">
								<a [href]="link">{{ link }}</a>
							</li>
						</ul>
					</td>
				</tr>
				</tbody>
			</ng-container>
		</table>
	`,
})
export class ClimbsComponent {
	@Input({required: true}) climbsByArea!: DataLookupResult
}
