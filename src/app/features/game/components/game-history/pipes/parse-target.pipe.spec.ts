import { ParseTargetPipe } from './parse-target.pipe';
import * as utils from '../game-history.utils';

describe('ParseTargetPipe', () => {
  it('create an instance', () => {
    const pipe = new ParseTargetPipe();
    expect(pipe).toBeTruthy();
  });

  it('should call parseGameHistoryTarget with the provided value', () => {
    const pipe = new ParseTargetPipe();
    const spy = jest.spyOn(utils, 'parseGameHistoryTarget').mockReturnValue([]);
    
    const result = pipe.transform('test value');
    
    expect(spy).toHaveBeenCalledWith('test value');
    expect(result).toEqual([]);
    spy.mockRestore();
  });
});
