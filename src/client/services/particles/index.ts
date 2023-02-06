import { IServiceInterface } from "@/types";
import anime                 from "animejs";
import sample from "lodash/sample";

type ParticlesEmitParams = {
  imageIds: string[];
  particlesCountMin: number;
  particlesCountMax: number;
  particlesDurationMin: number;
  particlesDurationMax: number;
  particlesDirectionXMin: number;
  particlesDirectionXMax: number;
  particlesDirectionYMin: number;
  particlesDirectionYMax: number;
  particlesScaleMin: number;
  particlesScaleMax: number;
  particlesRotationMin: number;
  particlesRotationMax: number;
}

class Service_Particles implements IServiceInterface {
  init(): void {}

  emit(rect: DOMRect, params: ParticlesEmitParams) {
    //todo skip particles in fullscreen mode
    // if (window.Config.isServer())
    //   return;

    const listOfParticles = new Array(Math.min(10, anime.random(params.particlesCountMin, params.particlesCountMax))).fill(null).map(_ => {
      var particle = document.createElement("div");
      particle.classList.add("dot");
      particle.style.position = 'absolute';

      particle.style.backgroundImage  = `url("${window.ApiClient.files.getFileUrl(sample(params.imageIds) as string)}")`;
      particle.style.left     = `${rect.x + rect.width}px`;
      particle.style.top      = `${rect.y}px`;
      return document.body.appendChild(particle);
    });
    const duration = anime.random(params.particlesDurationMin, params.particlesDurationMax)
    anime({
      loop:    false,
      easing:  "easeInOutQuad",
      targets: listOfParticles,
      duration,
      translateX: (_: any, i: number) => [0, anime.random(params.particlesDirectionXMin, params.particlesDirectionXMax)],
      translateY: (_: any, i: number) => [0, anime.random(params.particlesDirectionYMin, params.particlesDirectionYMax)],
      rotateZ: (_: any, i: number) => [0, anime.random(params.particlesRotationMin, params.particlesRotationMax)],
      scale: (_: any, i: number) => [0, anime.random(params.particlesScaleMin, params.particlesScaleMax)],
      opacity: [
        {value: 0, duration: 0}, // 0
        {value: 1, duration: duration - duration/4}, // 20%
        {value: 0, duration: duration/4} // 100%
      ],
      complete: () => {
        listOfParticles.forEach(c => document.body.removeChild(c))
      }
    });
  }
}

export default Service_Particles;
