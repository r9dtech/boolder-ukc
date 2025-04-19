import {Component} from '@angular/core';
import {parseBoolderExport} from '../../lib/boolder.mjs';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <h1>boolder-ukc</h1>
    <h2>A tool to find Boolder climbs on ukc</h2>
    <p><small>This is probably quite brittle - if UKC change things then it might stop working!</small></p>
    <form (submit)="$event.preventDefault()">
      <label>Upload Boolder export:
        <input type="file" accept=".json,application/json" (change)="uploadFile($event)">
      </label>
    </form>
    <pre>{{ boolderExportStatus ?? "Please upload a boolder export file" }}</pre>
  `,
})
export class AppComponent {
  title = 'boolder-ukc';

  boolderExportStatus?: string;

  token?: symbol;

  constructor() {
    console.log("hi");
  }

  uploadFile(event: Event) {
    delete this.boolderExportStatus;
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
          const boolderExport = await parseBoolderExport(JSON.parse(reader.result as string));
          this.boolderExportStatus = `Found ${boolderExport.ticks.length} climbs`
        } catch (e: unknown) {
          this.boolderExportStatus = `${e}`;
        }
      }
      reader.readAsText(fileList[0]);
    }
  }
}
