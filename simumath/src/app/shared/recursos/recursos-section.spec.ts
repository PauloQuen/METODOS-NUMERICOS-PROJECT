import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecursosSection, type GrupoRecursos } from './recursos-section';

const GRUPOS: GrupoRecursos[] = [
  {
    id: 'metodo',
    titulo: 'De Lagrange',
    descripcion: 'Material específico.',
    videos: [
      {
        id: 'v1',
        titulo: 'Lagrange paso a paso',
        canal: 'Canal de prueba',
        duracion: '10 min',
        youtubeId: 'abc123',
        estado: 'ok',
      },
    ],
    fuentes: [
      {
        id: 'f1',
        titulo: 'Polinomio de Lagrange',
        entidad: 'Wikipedia',
        tipo: 'web',
        url: 'https://es.wikipedia.org/wiki/Polinomio_de_Lagrange',
        estado: 'ok',
      },
    ],
    profundizacion: [],
  },
  {
    id: 'tipo',
    titulo: 'Del tipo Interpolación',
    videos: [],
    fuentes: [
      {
        id: 'f2',
        titulo: 'Interpolación polinómica',
        entidad: 'Wikipedia',
        tipo: 'web',
        url: 'https://es.wikipedia.org/wiki/Interpolaci%C3%B3n_polin%C3%B3mica',
        estado: 'ok',
      },
    ],
    profundizacion: [],
  },
];

describe('RecursosSection', () => {
  let fixture: ComponentFixture<RecursosSection>;

  function crear(grupos: GrupoRecursos[] = GRUPOS): void {
    fixture = TestBed.createComponent(RecursosSection);
    fixture.componentRef.setInput('grupos', grupos);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursosSection],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('separa los recursos por alcance con su encabezado', () => {
    crear();

    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('De Lagrange');
    expect(texto).toContain('Del tipo Interpolación');
    expect(texto).toContain('Material específico.');
  });

  it('no crea el iframe hasta que el alumno pide el video', () => {
    crear();
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();

    const boton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (b) => (b as HTMLButtonElement).textContent?.trim() === 'Ver video',
    ) as HTMLButtonElement;
    expect(boton).toBeTruthy();

    boton.click();
    fixture.detectChanges();

    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    expect(iframe.src).toContain('youtube-nocookie.com/embed/abc123');
    expect(iframe.getAttribute('loading')).toBe('lazy');
  });

  it('marca los enlaces externos con noopener noreferrer', () => {
    crear();

    const enlaces = Array.from(
      fixture.nativeElement.querySelectorAll('a[target="_blank"]'),
    ) as HTMLAnchorElement[];

    expect(enlaces.length).toBeGreaterThanOrEqual(2);
    for (const enlace of enlaces) {
      expect(enlace.rel).toContain('noopener');
      expect(enlace.rel).toContain('noreferrer');
    }
  });

  it('mantiene la forma plana histórica', () => {
    fixture = TestBed.createComponent(RecursosSection);
    fixture.componentRef.setInput('fuentes', [
      {
        id: 'plana',
        titulo: 'Una fuente',
        tipo: 'libro',
        estado: 'ok',
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Una fuente');
    expect(fixture.nativeElement.textContent).not.toContain('Del tipo');
  });
});
