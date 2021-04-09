import {
  ArcRotateCamera,
  Axis,
  Color4,
  DefaultRenderingPipeline,
  Effect,
  Engine,
  Mesh,
  NoiseProceduralTexture,
  ParticleSystem,
  PostProcess,
  Scene,
  SceneLoader,
  Space,
  Texture,
  Vector3,
} from '@babylonjs/core';

/**
 * Canvas Manager.
 */
export default class CanvasManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;
  private mainCamera: ArcRotateCamera;

  private noiseTexture: NoiseProceduralTexture;

  private frameCount: number;

  /**
   * constrcutor.
   * @param {HTMLCanvasElement} _canvas canvas element
   */
  public constructor(_canvas: HTMLCanvasElement) {
    this.canvas = _canvas;
    this.engine = new Engine(this.canvas);
    this.scene = new Scene(this.engine);

    this.frameCount = 0;

    this.mainCamera = new ArcRotateCamera(
        'mainCamera',
        -Math.PI / 2,
        Math.PI / 2,
        1.5,
        new Vector3(0, 0, 0),
        this.scene,
        true,
    );

    this.noiseTexture = new NoiseProceduralTexture('noise', 1, this.scene);
    this.noiseTexture.brightness = 0.2;
    this.noiseTexture.level = 0.5;
    this.noiseTexture.animationSpeedFactor = 1;

    this.initScene();

    this.engine.runRenderLoop(() => {
      this.update();
    });
  }

  /**
   * init scene
   */
  private initScene() {
    const pipeline = new DefaultRenderingPipeline(
        'defaultRP',
        true,
        this.scene,
    );

    this.customPP();

    pipeline.samples = 16;

    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.8;
    pipeline.bloomWeight = 0.5;
    pipeline.bloomScale = 0.5;
    pipeline.bloomKernel = 64;

    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.colorGradingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.colorCurvesEnabled = true;
    pipeline.imageProcessing.vignetteEnabled = true;
    pipeline.imageProcessing.vignetteWeight = 10;
    if (pipeline.imageProcessing.colorCurves !== null) {
      pipeline.imageProcessing.colorCurves.globalSaturation = 70;
      pipeline.imageProcessing.contrast = 1.2;
    }

    setInterval(() => {
      const arrayBufferView = this.noiseTexture.readPixels();
      if (arrayBufferView !== null) {
        const val = new Uint8Array(arrayBufferView.buffer)[0];

        if (false) {
          pipeline.imageProcessing.contrast = 10;
          pipeline.grainEnabled = true;
          pipeline.grain.intensity = 200;
          pipeline.grain.animated = true;
          pipeline.chromaticAberrationEnabled = true;
          pipeline.chromaticAberration.aberrationAmount = 500;
          pipeline.chromaticAberration.radialIntensity = 2;
        } else {
          pipeline.imageProcessing.contrast = 1.2;
          pipeline.grainEnabled = false;
          pipeline.chromaticAberrationEnabled = false;
        }
      }
    }, 100);

    // particle system settings
    const particleSystem = new ParticleSystem('particle', 5000, this.scene);
    particleSystem.emitter = new Vector3(0, 0, 0);
    particleSystem.particleTexture = new Texture(
      process.env.GH_PAGES === 'true' ?
        '/babylon-lowpoly-showcase/img/particle.png' :
        '/img/particle.png',
      this.scene,
    );
    particleSystem.maxSize = 0.003;
    particleSystem.minSize = 0.003;
    particleSystem.color1 = new Color4(1.2, 1.2, 1.2, 1);
    particleSystem.color2 = new Color4(1.2, 1.2, 1.2, 1);
    particleSystem.colorDead = new Color4(1, 1, 1, 0);
    particleSystem.direction1 = new Vector3(0);
    particleSystem.direction2 = new Vector3(0);
    particleSystem.maxLifeTime = 10;
    particleSystem.minLifeTime = 10;

    const noiseTexture = new NoiseProceduralTexture('perlin', 256, this.scene);
    noiseTexture.animationSpeedFactor = 1;
    noiseTexture.persistence = 1;
    noiseTexture.brightness = 0.5;
    noiseTexture.octaves = 2;

    particleSystem.noiseTexture = noiseTexture;
    particleSystem.noiseStrength = new Vector3(0.03, 0.03, 0.03);

    particleSystem.emitRate = 10;

    particleSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;

    particleSystem.preWarmCycles = 200;

    particleSystem.start();

    SceneLoader.ImportMeshAsync(
        'trophy',
      process.env.GH_PAGES === 'true' ?
        '/babylon-lowpoly-showcase/scenes/' :
        '/scenes/',
      'scene.babylon',
      this.scene,
      (event) => {
        if (event.lengthComputable) {
          const progress = event.loaded / event.total;
          console.log(`loading progress: ${Math.ceil(progress * 100)}%`);
        }
      },
    ).then((_scene) => {
      const trophy = <Mesh>_scene.meshes[0];
      if (trophy !== null) {
        trophy.position = new Vector3(0, -0.2, 0);
        trophy.scaling = trophy.scaling.multiplyByFloats(0.5, 0.5, 0.5);
        trophy.rotate(Axis.Y, 1.5 * Math.PI, Space.WORLD);
        trophy.convertToFlatShadedMesh();
      }
    });

    this.scene.clearColor = new Color4(0.014, 0.017, 0.021, 1);
  }

  private customPP() {
    Effect.ShadersStore['customFragmentShader'] = `
      precision highp float;
        
      uniform float time;
      uniform vec2 resolution;
      uniform sampler2D textureSampler;

      varying vec2 vUV;

      float random(vec2 c){
        return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      //
      // Description : Array and textureless GLSL 2D/3D/4D simplex
      //               noise functions.
      //      Author : Ian McEwan, Ashima Arts.
      //  Maintainer : ijm
      //     Lastmod : 20110822 (ijm)
      //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
      //               Distributed under the MIT License. See LICENSE file.
      //               https://github.com/ashima/webgl-noise
      //

      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 permute(vec4 x) {
            return mod289(((x*34.0)+1.0)*x);
      }

      vec4 taylorInvSqrt(vec4 r)
      {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

      float snoise3(vec3 v)
        {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;

      // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        //   x0 = x0 - 0.0 + 0.0 * C.xxx;
        //   x1 = x0 - i1  + 1.0 * C.xxx;
        //   x2 = x0 - i2  + 2.0 * C.xxx;
        //   x3 = x0 - 1.0 + 3.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

      // Permutations
        i = mod289(i);
        vec4 p = permute( permute( permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      // Gradients: 7x7 points over a square, mapped onto an octahedron.
      // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

      //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

      // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                      dot(p2,x2), dot(p3,x3) ) );
        }
                
      const float interval = 7.0;

      void main(void){
        float strength = smoothstep(interval * 0.7, interval, interval - mod(time, interval));
        vec2 shake = vec2(strength * 8.0 + 0.5) * vec2(
          random(vec2(time)) * 2.0 - 1.0,
          random(vec2(time * 2.0)) * 2.0 - 1.0
        ) / resolution;

        float y = vUV.y * resolution.y;
        float rgbWave = (
            snoise3(vec3(0.0, y * 0.01, time * 400.0)) * (2.0 + strength * 32.0)
            * snoise3(vec3(0.0, y * 0.02, time * 200.0)) * (1.0 + strength * 4.0)
            + step(0.9995, sin(y * 0.005 + time * 1.6)) * 12.0
            + step(0.9999, sin(y * 0.005 + time * 2.0)) * -18.0
          ) / resolution.x;
        float rgbDiff = 0.001;
        float rgbUvX = vUV.x;
        float r = texture2D(textureSampler, vec2(rgbUvX + rgbDiff, vUV.y) + shake*0.5).r;
        float g = texture2D(textureSampler, vec2(rgbUvX, vUV.y)).g;
        float b = texture2D(textureSampler, vec2(rgbUvX - rgbDiff, vUV.y) + shake*0.5).b;

        float whiteNoise = (random(vUV + mod(time, 10.0)) * 2.0 - 1.0) * (0.15 + strength * 0.15);

        float bnTime = floor(time * 20.0) * 200.0;
        float noiseX = step((snoise3(vec3(0.0, vUV.x * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
        float noiseY = step((snoise3(vec3(0.0, vUV.y * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
        float bnMask = noiseX * noiseY;
        float bnUvX = vUV.x + sin(bnTime) * 0.2 + rgbWave;
        float bnR = texture2D(textureSampler, vec2(bnUvX + rgbDiff, vUV.y)).r * bnMask;
        float bnG = texture2D(textureSampler, vec2(bnUvX, vUV.y)).g * bnMask;
        float bnB = texture2D(textureSampler, vec2(bnUvX - rgbDiff, vUV.y)).b * bnMask;
        vec4 blockNoise = vec4(bnR, bnG, bnB, 1.0);

        float bnTime2 = floor(time * 25.0) * 300.0;
        float noiseX2 = step((snoise3(vec3(0.0, vUV.x * 2.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.5);
        float noiseY2 = step((snoise3(vec3(0.0, vUV.y * 8.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.3);
        float bnMask2 = noiseX2 * noiseY2;
        float bnR2 = texture2D(textureSampler, vec2(bnUvX + rgbDiff, vUV.y)).r * bnMask2;
        float bnG2 = texture2D(textureSampler, vec2(bnUvX, vUV.y)).g * bnMask2;
        float bnB2 = texture2D(textureSampler, vec2(bnUvX - rgbDiff, vUV.y)).b * bnMask2;
        vec4 blockNoise2 = vec4(bnR2, bnG2, bnB2, 1.0);

        float waveNoise = (sin(vUV.y * 1200.0) + 1.0) / 2.0 * (0.15 + strength * 0.2);

        gl_FragColor = vec4(r, g, b, 1.0) + (blockNoise + blockNoise2)*5.0;
      }
    `;

    const postProcess = new PostProcess(
        'glitch', 'custom', ['resolution', 'time'], null, 1.0, this.mainCamera,
    );
    postProcess.onApply = (effect:Effect)=>{
      effect.setFloat2('resolution', postProcess.width, postProcess.height);
      effect.setFloat('time', this.frameCount/60);
      // this.frameCount+=this.engine.getDeltaTime();
      console.log(this.frameCount);
    };
  }
  /**
   * reder scene.
   */
  private update() {
    this.scene.render();

    this.frameCount++;
  }
}
