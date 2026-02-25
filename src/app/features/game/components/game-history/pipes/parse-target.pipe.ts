import { Pipe, PipeTransform } from '@angular/core';
import { TargetSegment, parseGameHistoryTarget } from '../game-history.utils';

@Pipe({
  name: 'parseTarget',
  standalone: true
})
export class ParseTargetPipe implements PipeTransform {
  transform(value: string | undefined): TargetSegment[] {
    return parseGameHistoryTarget(value);
  }
}
