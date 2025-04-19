import {Component} from '@angular/core';
import {BoolderExport, parseBoolderExport} from '../../lib/boolder.mjs';
import {ClimbsComponent} from './climbs/climbs.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    ClimbsComponent,
    NgIf
  ],
  template: `
    <h1>boolder-ukc</h1>
    <h2>A tool to find Boolder climbs on ukc</h2>
    <p><small>This is probably quite brittle - if UKC change things then it might stop working!</small></p>
    <form (submit)="$event.preventDefault()">
      <label>Upload Boolder export:
        <input type="file" accept=".json,application/json" (change)="uploadFile($event)">
      </label>
    </form>
    <pre>{{ fileParseStatus ?? "Please upload a boolder export file" }}</pre>
    <climbs *ngIf="boolderData !== undefined" [boolderData]="boolderData"></climbs>
  `,
})
export class AppComponent {
  title = 'boolder-ukc';

  fileParseStatus?: string;
  boolderData?: BoolderExport;

  token?: symbol;

  constructor() {
    console.log("hi");
  }

  uploadFile(event: Event) {
    delete this.fileParseStatus;
    delete this.boolderData;
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList?.length === 1) {
      const token = Symbol();
      this.token = token;
      const reader = new FileReader();
      reader.onload = async () => {
        if (token !== this.token) {
          return
        }
        try {
          const boolderData = await parseBoolderExport(JSON.parse(reader.result as string));
          this.fileParseStatus = `Found ${boolderData.ticks.length} climbs`
          this.boolderData = boolderData;
        } catch (e: unknown) {
          this.fileParseStatus = `${e}`;
        }
      }
      reader.readAsText(fileList[0]);
    }
  }
}
