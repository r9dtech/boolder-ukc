import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <h1>boolder-ukc</h1>
    <h2>A tool to log boolder climbs on ukc</h2>
    <p><small>This is probably quite brittle - if UKC change things then it might stop working!</small></p>
    <form (submit)="$event.preventDefault()">
      <label>Upload Boolder export:
        <input type="file" (change)="uploadFile($event)">
      </label>
      <pre>
        {{ boolderExport }}
      </pre>
    </form>
  `,
})
export class AppComponent {
  title = 'boolder-ukc';

  boolderExport = "";

  constructor() {
    console.log("hi");
  }

  uploadFile(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList?.length === 1) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.boolderExport = reader.result as string
      }
      reader.readAsText(fileList[0]);
    }
  }
}
