import { Polygon, Polyline, PointArray } from '@svgdotjs/svg.js';

type StarSettings = {
  inner: number;
  outer: number;
  radius: number;
};

type NgonSettings = {
  edges: number;
  radius: number;
};

declare module "@svgdotjs/svg.js" {
  interface Polyline {
    star(settings: StarSettings): Polyline;
    ngon(settings: NgonSettings): Polyline;
  }

  interface Polygon {
    star(settings: StarSettings): Polygon;
    ngon(settings: NgonSettings): Polygon;
  }

  interface Svg {
    shapes: {
      defaults: {
        spikes: number;
        inner: number;
        outer: number;
        edges: number;
        radius: number;
      };
      star(settings: StarSettings): PointArray;
      ngon(settings: NgonSettings): PointArray;
    };
  }
}