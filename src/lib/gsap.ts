import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, Flip)

gsap.defaults({ ease: 'power2.out', duration: 0.8 })

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, Flip }
