import { CategoryColorDirective } from './category-color';
import { ElementRef, Renderer2 } from '@angular/core';

describe('CategoryColor', () => {
  it('should create an instance', () => {
    const elMock = { nativeElement: document.createElement('span') } as ElementRef;
    const rendererMock = {
      setStyle: () => { }
    } as unknown as Renderer2;

    const directive = new CategoryColorDirective(elMock, rendererMock);
    expect(directive).toBeTruthy();
  });
});