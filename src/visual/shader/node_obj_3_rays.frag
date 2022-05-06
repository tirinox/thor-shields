// original by nimitz https://www.shadertoy.com/view/lsSGzy#, slightly modified
varying vec2 vUv;
uniform float time;
uniform vec3 color;

#define ray_brightness 12.
#define gamma 2.
#define ray_density 7.5
#define curvature 45.
//#define red   0.3
//#define green 3.0
//#define blue  3.0

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!! UNCOMMENT ONE OF THESE TO CHANGE EFFECTS !!!!!!!!!!!

#define MODE3 *
// #define MODE3 +

#define MODE2 r +
// #define MODE2 

//#define DIRECTION +
#define DIRECTION -

#define SIZE 0.02

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


float hash(float x) {
    return fract(21654.6512 * sin(385.51 * x));
}

float hash(vec2 p) {
    return fract(21654.65155 * sin(35.51 * p.x + 45.51 * p.y));
}

float lhash(float x, float y) {
    float h = 0.0;

    for (int i = 0; i < 5; i++) {
        h += (fract(21654.65155 * float(i) * sin(35.51 * x + 45.51 * float(i) * y * (5.0 / float(i)))) * 2.0 - 1.0) / 10.0;
    }
    return h / 5.0 + 0.02;
    return (fract(21654.65155 * sin(35.51 * x + 45.51 * y)) * 2.0 - 1.0) / 20.0;
}

float noise(vec2 p) {
    p *= 5.02;
    vec2 fl = floor(p);
    vec2 fr = fract(p);

    fr.x = smoothstep(0.0, 1.0, fr.x);
    fr.y = smoothstep(0.0, 1.0, fr.y);

    float a = mix(hash(fl + vec2(0.0, 0.0)), hash(fl + vec2(1.0, 0.0)), fr.x);
    float b = mix(hash(fl + vec2(0.0, 1.0)), hash(fl + vec2(1.0, 1.0)), fr.x);

    return mix(a, b, fr.y);
}


/*float noise( in vec2 x )
{
	return texture(iChannel0, x*.02).x; // INCREASE MULTIPLIER TO INCREASE NOISE
}*/

// FLARING GENERATOR, A.K.A PURE AWESOME
mat2 m2 = mat2(0.80, 0.60, -0.60, 0.80);
float fbm(in vec2 p)
{
    float z=2.;// EDIT THIS TO MODIFY THE INTENSITY OF RAYS
    float rz = -0.05;// EDIT THIS TO MODIFY THE LENGTH OF RAYS
    p *= 0.25;// EDIT THIS TO MODIFY THE FREQUENCY OF RAYS
    for (int i= 1; i < 6; i++)
    {
        rz+= abs((noise(p)-0.5)*2.)/z;
        z = z*2.;
        p = p*2.*m2;
    }
    return rz;
}

void main()
{
    float t = DIRECTION time*.33;
    vec2 uv = vUv-0.5;
    //    uv.x *= iResolution.x/iResolution.y;
    uv*= curvature* SIZE;

    float r = sqrt(dot(uv, uv));// DISTANCE FROM CENTER, A.K.A CIRCLE
    float x = dot(normalize(uv), vec2(.5, 0.))+t;
    float y = dot(normalize(uv), vec2(.0, .5))+t;

    float val;
    val = fbm(vec2(MODE2 y * ray_density, MODE2 x MODE3 ray_density));// GENERATES THE FLARING
    val = smoothstep(gamma*.02-.1, ray_brightness+(gamma*0.02-.1)+.001, val);
    val = 15. * val;// WE DON'T REALLY NEED SQRT HERE, CHANGE TO 15. * val FOR PERFORMANCE

    vec3 col = val / color;// vec3(red,green,blue);
    col = 1.-col;// WE DO NOT NEED TO CLAMP THIS LIKE THE NIMITZ SHADER DOES!
    float rad= 10.0;//30. * texture(iChannel1, vec2(0,0)).x; // MODIFY THIS TO CHANGE THE RADIUS OF THE SUNS CENTER
    col = mix(col, vec3(1.), rad - 266.667 * r);// REMOVE THIS TO SEE THE FLARING

    // viniett
    float a = r > 0.33 ? clamp(1.0 - 10.0 * (r - 0.33), 0.0, 1.0) : 1.0;



    gl_FragColor = vec4(col, a * clamp(col.b + col.g + col.r, 0.0, 1.0));
}