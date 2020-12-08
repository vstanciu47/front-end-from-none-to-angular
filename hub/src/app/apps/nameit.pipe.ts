import { Pipe, PipeTransform } from '@angular/core';
import { Launcher } from './apps.service';

@Pipe({ name: 'nameit' })
export class NameitPipe implements PipeTransform {

  transform(value?: string, type?: Launcher["type"]): string {
    return `[${type || "unknown"}] ${value}`;
  }

}
