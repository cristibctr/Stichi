import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  TextureLoader
} from 'three';

@Component({
  selector: 'app-product-card3d',
  templateUrl: './product-card3d.component.html',
  styleUrls: ['./product-card3d.component.css']
})
export class ProductCard3dComponent implements AfterViewInit, OnDestroy {
  @Input() product!: any;
  @Output() add = new EventEmitter<any>();
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  fallback = false;
  private renderer?: WebGLRenderer;
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private light?: DirectionalLight;
  private mesh?: Mesh;
  private reduce = false;

  constructor(private settings: SettingsService, private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.reduce = this.settings.prefersReducedMotion();
    if (this.reduce || !this.canWebGL()) {
      this.fallback = true;
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = this.host.nativeElement.getBoundingClientRect();

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(rect.width, rect.height);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, rect.width / rect.height, 0.1, 100);
    this.camera.position.z = 1.5;

    const geometry = new PlaneGeometry(1, 1, 32, 32);
    const loader = new TextureLoader();
    const materialOpts: any = { map: loader.load(this.product.image) };
    if (this.product.normalMap) materialOpts.normalMap = loader.load(this.product.normalMap);
    if (this.product.depthMap) materialOpts.displacementMap = loader.load(this.product.depthMap);
    const material = new MeshStandardMaterial(materialOpts);

    this.mesh = new Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.light = new DirectionalLight(0xffffff, 1);
    this.light.position.set(0, 0, 1);
    this.scene.add(this.light);

    const render = () => {
      if (!this.renderer) return;
      this.renderer.render(this.scene!, this.camera!);
      requestAnimationFrame(render);
    };
    render();

    this.host.nativeElement.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.light) return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height * 2 - 1);
    this.light.position.set(x, y, 1);
  };

  private onResize = () => {
    if (!this.renderer || !this.camera) return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
  };

  addToCart(): void {
    this.add.emit(this.product);
  }

  ngOnDestroy(): void {
    this.host.nativeElement.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
    this.renderer?.dispose();
  }

  private canWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }
}
