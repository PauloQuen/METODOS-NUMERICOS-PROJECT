import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Modulo1 } from './modulo1';

describe('Modulo1', () => {
  let component: Modulo1;
  let fixture: ComponentFixture<Modulo1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modulo1],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modulo1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
