import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import portalVertexShader from '../static/shaders/portal/vertex.glsl'
import portalFragmentShader from '../static/shaders/portal/fragment.glsl'
import { gsap } from 'gsap'
import { PixiPlugin } from "gsap/PixiPlugin.js";
import { MotionPathPlugin } from "gsap/MotionPathPlugin.js";
import  MeshReflectorMaterial  from '../static/shaders/MeshReflectorMaterial';
import { BackSide, DoubleSide, LoadingManager } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'



//without this line, PixiPlugin and MotionPathPlugin may get dropped by your bundler (tree shaking)...
gsap.registerPlugin(PixiPlugin, MotionPathPlugin);


//Texture load


/**
 * Base
 */
// Debug
////////////////////////////////////////////////////////////////////////////////////////
//VARIABLE DECLARATIONS
///////////////////////////////////////////////////////////////////////////////////////

let model = null
let  floorMesh = null 
let leftWallMesh = null
let rightWallMesh = null
let backWallMesh = null
let portalPlane = null
let scss = null 
let javascript = null 
let blender = null
let debug = false 
let controls = false
let isMobile = false 

// Debug

const debugObject = {}
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//SIZES
////////////////////////////////////////////////////////////////////////////////////////////////////////

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}




window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // Update effect composer
// effectComposer.setSize(sizes.width, sizes.height)
// effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LIGHTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
scene.add(ambientLight)



// const pointLight = new THREE.PointLight(0xffffff, 6.5)
// scene.add(pointLight)
// pointLight.position.set(0,6,0)
// pointLight.layers.set(1)

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
// directionalLight.castShadow = true
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.camera.left = - 7
// directionalLight.shadow.camera.top = 7
// directionalLight.shadow.camera.right = 7
// directionalLight.shadow.camera.bottom = - 7
// directionalLight.position.set(0, 50, 5)
// scene.add(directionalLight)

////////////////////////////////////////////////////////////////////////////////
//CAMERA
////////////////////////////////////////////////////////////////////////////////
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 50)
camera.position.set(1.5, 0, -4)
camera.lookAt(2,6,-15)


// camera.layers.enable(1)
scene.add(camera)

console.log(camera.path)
////////////////////////////////////////////////////////////////////////////////
// Controls
///////////////////////////////////////////////////////////////////////////////
if (controls) {
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
}

// controls.enableDamping = false
// controls.minDistance = -10
// controls.zoomSpeed = 8

                    // const startOrientation = camera.quaternion.clone();
                    // const targetOrientation = portalMesh.quaternion.clone().normalize();
                        
                    // gsap.to( {}, {
                    //     duration: 2,
                    //     onUpdate: function() {
                    //         camera.quaternion.copy(startOrientation).slerp(targetOrientation, this.progress());
                    //     }
                    // } );



const cameraIntro = gsap.timeline()
cameraIntro
  .to(camera.position, { x: 1.5, y:0.2, z: -4 })
  .to(camera.position, { x: 0, y: 1, duration: 5, ease: "power4.inOut(2,4)" })

//   cameraIntro.to(controls.target.set(1.5, 5,-15), { x: 2, y: 7, z: -15, duration: 5, ease: 'sine.inOut' }, "+=1")
// onComplete
  
// inherit:false
//   cameraIntro.pause()
// cameraIntro.progress(0.5)
// cameraIntro.seek(2)
// const cameraScripting = gsap.timeline()
// cameraScripting

// // console.log(controls.target)

// .to(camera.position, { x:1.5, y: 0.2, z: -4, duration: 6, ease: 'sine.inOut'} )
// .to(controls.target.set(1.5, 5,-15), { x: 2, y: 7, z: -15, duration: 5, ease: 'sine.inOut' })


/////////////////////////////////////////////////////////////////////////////////
//RENDERER
//////////////////////////////////////////////////////////////////////////////////
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true, 
    // powerPreference: "high-performance" 
})
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor( 'black' );
renderer.autoClear = false ; //without this unreal bloom does not work 
renderer.setPixelRatio(2); //Performance
renderer.setSize(window.innerWidth, window.innerHeight);

///////////////////////////////////////////////////////////////////////////////////////
///// POST PROCESSING
//////////////////////////////////////////////////////////////////////////////////////
//!!!!!!  TRY IF YOU CAN TARGET ONLY NEONS WITH THIS FOR Performance
// Render Target
// console.log(renderer.getPixelRatio())
const renderTarget = new THREE.WebGLRenderTarget(
    800,
    600,
    {
        // samples: renderer.getPixelRatio() <= 2 ? 3 : 0
        samples: 4 // if can isolate to only target neons this number can be raised 
    }
)
const effectComposer = new EffectComposer(renderer, renderTarget) // you may be able to delete if only one pass , I am not sure
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // as  renderer.
effectComposer.setSize(window.innerWidth, window.innerHeight);// as renderer
const renderPass = new RenderPass(scene, camera)

effectComposer.addPass(renderPass)

// Unreal Bloom pass
const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.enabled = true
effectComposer.addPass(unrealBloomPass)

unrealBloomPass.exposure = 3.0
unrealBloomPass.strength = 1.8
unrealBloomPass.radius = 1
unrealBloomPass.threshold = 0.2

gui.add(unrealBloomPass, 'enabled')
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)

// Gamma correction pass
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
effectComposer.addPass(gammaCorrectionPass)

// Antialias pass
if(renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)

    console.log('Using SMAA')
}









/////////////////////////////////////////////////////////////////////////////////////////////
/// HELPERS 
//////////////////////////////////////////////////////////////////////////////////////////
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );











/**
 * Loadin Manager
 */

 const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
     console.log('loaded')
       
    },

    // Progress
    () =>
        {
            console.log('progress')
        },
    //error
    (error) =>
    {
        console.log('there is an error')
    }
)

const gltfLoader = new GLTFLoader(loadingManager)

//  const loadingBarElement = document.querySelector('.loading-bar')
//  const loadingManager = new THREE.LoadingManager(
//      // Loaded
//      () =>
//      {
//          // Wait a little
//          window.setTimeout(() =>
//          {
//              // Animate overlay
//              gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })
 
//              // Update loadingBarElement
//              loadingBarElement.classList.add('ended')
//              loadingBarElement.style.transform = ''
//          }, 500)
//      },
 
//      // Progress
//      (itemUrl, itemsLoaded, itemsTotal) =>
//      {
//          // Calculate the progress and update the loadingBarElement
//          const progressRatio = itemsLoaded / itemsTotal
//          loadingBarElement.style.transform = `scaleX(${progressRatio})`
//      }
//  )

//  const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)
/**
 * Overlay
 */
//  const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
//  const overlayMaterial = new THREE.ShaderMaterial({
//     //  wireframe: true,
//      transparent: true,
//      uniforms:
//      {
//          uAlpha: { value: 1 }
//      },
//      vertexShader: `
//          void main()
//          {
//              gl_Position = vec4(position, 1.0);
//          }
//      `,
//      fragmentShader: `
//          uniform float uAlpha;
 
//          void main()
//          {
//              gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
//          }
//      `
//  })
//  const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
//  scene.add(overlay)










///////////////////////////////////////////////////////////////////////////////
////// ENV MAP
//////////////////////////////////////////////////////////////////////////

// const cubeTextureLoader = new THREE.CubeTextureLoader()
// const environmentMap = cubeTextureLoader.load([
//     '/textures/enviromentMap/1/px.jpg',
//     '/textures/enviromentMap/1/nx.jpg',
//     '/textures/enviromentMap/1/py.jpg',
//     '/textures/enviromentMap/1/ny.jpg',
//     '/textures/enviromentMap/1/pz.jpg',
//     '/textures/enviromentMap/1/nz.jpg'
// ])
// scene.background = environmentMap




/////////////////////////////////////////////////////////////////////////////////
//TEXTURE LOADER
////////////////////////////////////////////////////////////////////////////////


const textureLoader = new THREE.TextureLoader(loadingManager)


// //////CURRENTLY WALL TEXTURES////////////////////////////////////////////////
// const floorColorTexture = textureLoader.load('/textures/floor-and-walls/BathroomTiles01_4K_BaseColor.png')
// const floorRoughnessTexture = textureLoader.load('/textures/floor-and-walls/BathroomTiles01_4K_Roughness.png')
// const floorNormalTexture = textureLoader.load('/textures/floor-and-walls/BathroomTiles01_4K_Normal.png')
// floorColorTexture.repeat.x = 1
// floorColorTexture.repeat.y = 1
// floorColorTexture.wrapS = THREE.RepeatWrapping
// floorColorTexture.wrapT = THREE.RepeatWrapping
// // floorColorTexture.rotation = 1
// floorColorTexture.needsUpdate = true
// /////////////////////////////////////////////////////////////////////////

const graniteDifuse = textureLoader.load('./textures/reflecting-material/Granite08large_MR_1K/Granite08large_1K_BaseColor.png')
const graniteRoughness = textureLoader.load('./textures/reflecting-material/Granite08large_MR_1K/Granite08large_1K_Roughness.png')
const graniteNormal = textureLoader.load('./textures/reflecting-material/Granite08large_MR_1K/Granite08large_1K_Normal.png')
const whiteTilesDifuse = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_BaseColor.png')
const whiteTilesRoughness = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_Roughness.png')
const whiteTilesNormal = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_Normal.png')
const testDiffuse = textureLoader.load('./textures/floor-and-walls/Soapstone01_4K_BaseColor.png')
// const diffuse = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_Normal.png')
// const diffuse = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_Normal.png')
// const diffuse = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_Normal.png')
// const diffuse = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_Normal.png')
// // floorNormalTexture.matrixAutoUpdate = true

const mediEvilWallDiffuse = textureLoader.load('./textures/floor-and-walls/medievil-wall-diff-1K.jpg')

testDiffuse.rotation = Math.PI /2
testDiffuse.repeat.x = 6
testDiffuse.repeat.y = 4
testDiffuse.wrapS = THREE.RepeatWrapping
testDiffuse.wrapT = THREE.RepeatWrapping




/////////////////////////////////////////////////////////////
/////////////// NATIVE WALLS
//////////////////////////////////////////////

// const fakeEmissionMesh = new THREE.Mesh(new THREE.PlaneGeometry(8,6), new THREE.MeshBasicMaterial({transparent: true,  opacity: 0.5, color: 'white',  side: DoubleSide}))
// scene.add(fakeEmissionMesh)
// fakeEmissionMesh.position.set(10.95,3,-6)
// fakeEmissionMesh.rotateY(Math.PI /4)


// fakeEmissionMesh.layers.enable(1)

// const rightWallGeometry = new THREE.PlaneGeometry( 22, 20 );

// const rightWallMaterial = new THREE.MeshStandardMaterial( {} );
// const rightWallPlane = new THREE.Mesh( rightWallGeometry, rightWallMaterial );
// rightWallPlane.rotateY(Math.PI / 2)
// rightWallPlane.position.set(20,10,0)
// // rightWallPlane.layers.set(1)
// scene.add( rightWallPlane );


// testDiffuse.needsUpdate = true 
// rightWallPlane.material = testDiffuse
// const floorOriginalMaterial = rightWallPlane.material;

// //   
//     rightWallPlane.material = new MeshReflectorMaterial(renderer, camera, scene, rightWallPlane,
//         {
//             resolution: 512,
//             blur: [1024,1024],
//             mixStrength: 1,
//             planeNormal: new THREE.Vector3(0, 0, 1),
//             mixContrast: 1,
//             bufferSamples: 16,
//             depthToBlurRatioBias: 0.6,
//             mixBlur: 5,
//             mixContrast: 1,
//             minDepthThreshold: 0.5, 
//             maxDepthThreshold: 2.9,
//             depthScale: 1.7,
//             // mirror: 1,
//             // distortionMap: whiteTilesNormal
//         });
//         rightWallPlane.material.setValues({
//             // roughnessMap:whiteTilesRoughness,
//             map: testDiffuse,
//             normalScale: new THREE.Vector2(0.25, 0.25),
//             // normalMap: testDiffuse,
//             emissiveMap: testDiffuse,
//             emissive: new THREE.Color(0xffffff),
//             emissiveIntensity: 0.6,
//             envMapIntensity: 0.2,
//             roughness:0.2,
//             color: 0xffffff,
//             metalness: 1.5
//         })
//         floorOriginalMaterial.dispose();
//         renderer.renderLists.dispose();
        // rightWallPlane.material.envMap = environmentMap


            //         function addReflectorRightWallPlane(){
            //     if (debug){
            //         const reflectorFolder2 = gui.addFolder('right-wall')
            //         reflectorFolder2.add(rightWallPlane.material, 'roughness').min(0).max(2).step(0.001)
            //         reflectorFolder2.add(rightWallPlane.material, 'envMapIntensity').min(0).max(2).step(0.001)
            //         reflectorFolder2.add(rightWallPlane.material, 'emissiveIntensity').min(0).max(2).step(0.001)
            //         reflectorFolder2.add(rightWallPlane.material, 'metalness').min(0).max(2).step(0.001)
            //         // reflectorFolder2.arightWallPlaneloor.material, 'color')
            //         reflectorFolder2.add(rightWallPlane.material.reflectorProps, 'mixBlur').min(0).max(7).step(0.001)
            //         reflectorFolder2.add(rightWallPlane.material.reflectorProps, 'mixStrength').min(0).max(10).step(0.001)
            //         reflectorFolder2.add(rightWallPlane.material.reflectorProps, 'depthScale').min(0).max(20).step(0.1)
            //         reflectorFolder2.add(rightWallPlane.material.reflectorProps, 'mixContrast').min(0).max(7).step(0.001)
            //         reflectorFolder2.add(rightWallPlane.material.reflectorProps, 'minDepthThreshold').min(0).max(7).step(0.001)
            //         reflectorFolder2.add(rightWallPlane.material.reflectorProps, 'depthToBlurRatioBias').min(0).max(7).step(0.001)
            //         reflectorFolder2.add(rightWallPlane.material.reflectorProps, 'maxDepthThreshold').min(-5).max(7).step(0.001).onChange(function(){
            //             // rightWallPlane.material.needsUpdate = true;
            //         })
            //     }
            // }
    
            // addReflectorRightWallPlane()

///////////////////////////////////////////////////////////////
///// PORTAL 
///////////////////////////////////////////////////////

debugObject.portalColorStart = '#00FF04'
debugObject.portalColorEnd = '#5a5a5a'

gui
    .addColor(debugObject, 'portalColorStart')
    .onChange(() =>
    {
        portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
    })

gui
    .addColor(debugObject, 'portalColorEnd')
    .onChange(() =>
    {
        portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
    })

const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms:
    {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) }
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
})

const leftPortalGeomatry = new THREE.PlaneGeometry(8,5,1)
const leftPortalMaterial = new THREE.MeshStandardMaterial()
const portalMesh  = new THREE.Mesh(leftPortalGeomatry, leftPortalMaterial)
portalMesh.material = portalLightMaterial
portalMesh.position.z = -6
portalMesh.position.y = 6
portalMesh.position.x = -6
portalMesh.rotation.y = Math.PI * 0.5
scene.add(portalMesh)                  // const helper = new VertexNormalsHelper( portal, 1, 0xff0000 );
                    // scene.add(helper)



    // floorMesh.geometry.verticesNeedUpdate = true;
// floorMesh.geometry.normalsNeedUpdate = true;
// floorMesh.geometry.computeBoundingSphere();
// floorMesh.geometry.computeFaceNormals();
// floorMesh.geometry.computeVertexNormals();
    // floorOriginalMaterial.dispose();
    // renderer.renderLists.dispose();

/////////////////////////////////////////////////////////////////////////////////////////
////////// BAKED MATERIAL AND TEXTURES
///////////////////////////////////////////////////////////////////////////////////////


///// STICK THIS WITHIN A LOADING MANAGER
const neonTexture = textureLoader.load('models/focusNeon.jpg')
neonTexture.flipY = false
const bakedNeonMaterial = new THREE.MeshBasicMaterial({map: neonTexture})










///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GUI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// if(debug) {
// function lightsGUI() {
//     if(debug) {
//         const lightsFolder = gui.addFolder('Lights')
//         lightsFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.01).name('lightIntensity')
//         lightsFolder.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('lightDirectionX')
//         lightsFolder.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('lightDirectionY')
//         lightsFolder.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('lightDirectionZ')
      

//     }
// }
// lightsGUI()
// }


/////////////////////////////////////////////////////////////
//// MODEL LOADER
///////////////////////////////////////////////////////////


// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

// GLTF loader
// const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load(
    './models/cinema3.glb',
    (gltf) =>
    {
        if(gltf.scene) {
            model = gltf.scene
            scene.add(model)
        }
    gltf.scene.traverse((child) => {
        if(child.isMesh) {
            if(child.name == 'floor') 
            {
                floorMesh = child
                // const floorDifuseMap = floorMesh.material.map
                // const floorDifuseMap = bakedWallsMaterial.map
                const floorDiffuseMap = mediEvilWallDiffuse
                // const floorRoughnessMap = floorMesh.material.roughnessMap
                // const floorRoughnessMap = bakedWallsRoughnessMaterial.map
                // const floorNormalMap = floorMesh.material.normalMap
                // floorMesh.geometry.computeVertexNormals()
                // floorMesh.geometry.normalizeNormals()
                // floorRoughnessMap = flo
                floorMesh.material = new MeshReflectorMaterial(renderer, camera, scene, floorMesh,
                    {
                        resolution: 512,
                        blur: [1024,1024],
                        mixStrength: 1,
                        planeNormal: new THREE.Vector3(0, 1, 0),
                        mixContrast: 1,
                        bufferSamples: 16,
                        depthToBlurRatioBias: 0.6,
                        mixBlur: 5,
                        mixContrast: 1,
                        minDepthThreshold: 0.5,
                        maxDepthThreshold: 2.9,
                        depthScale: 1.7,
                        mirror: 1,
                        // distortionMap: whiteTilesNormal
                    });
                    floorMesh.material.setValues({
                        // roughnessMap:floorRoughnessMap,
                        map: floorDiffuseMap,
                        normalScale: new THREE.Vector2(0.25, 0.25),
                        // normalMap: floorNormalMap,
                        emissiveMap: floorDiffuseMap,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.6,
                        envMapIntensity: 0.2,
                        roughness:0.2,
                        color: 0xffffff,
                        metalness: 1.0,
                      
                    })
            }
            if(child.name == 'left-wall') 
            {
                leftWallMesh = child
                // const leftWallDifuseMap = leftWallMesh.material.map
                const leftWallDifuseMap = mediEvilWallDiffuse
                // const leftWallRoughnessMap = leftWallMesh.material.roughnessMap
                // const leftWallNormalMap = leftWallMesh.material.normalMap
               
                leftWallMesh.geometry.computeVertexNormals()
                // leftWallMesh.geometry.normalizeNormals()
            
                leftWallMesh.material = new MeshReflectorMaterial(renderer, camera, scene, leftWallMesh,
                    {
                        resolution: 512,
                        blur: [1024,1024],
                        mixStrength: 4,
                        planeNormal: new THREE.Vector3(1, 0, 0),
                        mixContrast: 1,
                        bufferSamples: 16,
                        depthToBlurRatioBias: 0.6,
                        mixBlur: 5,
                        mixContrast: 1,
                        minDepthThreshold: 0.5,
                        maxDepthThreshold: 2.9,
                        depthScale: 2.7,
                        mirror: 1,
                        // distortionMap: whiteTilesNormal
                    });
                    leftWallMesh.material.setValues({
                        // roughnessMap: leftWallRoughnessMap,
                        map: leftWallDifuseMap,
                        normalScale: new THREE.Vector2(0.25, 0.25),
                        // normalMap: leftWallNormalMap,
                        emissiveMap: leftWallDifuseMap,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.06,
                        envMapIntensity: 0.2,
                        roughness:0.6,
                        color: 0xffffff,
                        metalness: 0.7
                    })
                    // floorOriginalMaterial.dispose();
                    renderer.renderLists.dispose();

            }
            if(child.name == 'right-wall') 
            {
                rightWallMesh = child
                // rightWallMesh.material = mediEvilWallDiffuse
            
              rightWallMesh.layers.set(1)
                // const rightWallDifuseMap = bakedWallsMaterial.map
                // const rightWallDifuseMap = rightWallMesh.material.map
                // const rightWallRoughnessMap = rightWallMesh.material.roughnessMap
                // const rightWallNormalMap = rightWallMesh.material.normalMap
            //    rightWallMesh.position.x +=2
                // rightWallMesh.geometry.computeVertexNormals()
                // rightWallMesh.geometry.normalizeNormals()
              
                rightWallMesh.material = new MeshReflectorMaterial(renderer, camera, scene, rightWallMesh,
                    {
                        resolution: 512,
                        blur: [1024,1024],
                        mixStrength: 4,
                        planeNormal: new THREE.Vector3(-1, 0, 0),
                        mixContrast: 1,
                        bufferSamples: 16,
                        depthToBlurRatioBias: 0.6,
                        mixBlur: 5,
                        mixContrast: 1,
                        minDepthThreshold: 0.5,
                        maxDepthThreshold: 2.9,
                        depthScale: 2.7,
                        mirror: 1,
                        // distortionMap: whiteTilesNormal
                    });
                    rightWallMesh.material.setValues({
                        // roughnessMap:rightWallRoughnessMap,
                        map: testDiffuse,
                        normalScale: new THREE.Vector2(0.25, 0.25),
                        // normalMap: rightWallNormalMap,
                        emissiveMap: testDiffuse,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.2,
                        envMapIntensity: 0.2,
                        roughness:0.06,
                        color: 0xffffff,
                        metalness: 1.0,
                       
                    })
                    // floorOriginalMaterial.dispose();
                    // renderer.renderLists.dispose();
            }

            
            if(child.name == 'back-wall') 
            {
                backWallMesh = child
                const backWallDifuseMap = mediEvilWallDiffuse
                // const backWallDifuseMap = backWallMesh.material.map
                // const backWallRoughnessMap = backWallMesh.material.roughnessMap
                // const backWallNormalMap = backWallMesh.material.normalMap

                backWallMesh.material = new MeshReflectorMaterial(renderer, camera, scene, backWallMesh,
                    {
                        resolution: 512,
                        blur: [1024,1024],
                        mixStrength: 4,
                        planeNormal: new THREE.Vector3(0, 0, 1),
                        mixContrast: 1,
                        bufferSamples: 16,
                        depthToBlurRatioBias: 0.6,
                        mixBlur: 5,
                        mixContrast: 1,
                        minDepthThreshold: 0.5,
                        maxDepthThreshold: 2.9,
                        depthScale: 2.7,
                        mirror: 1,
                        // distortionMap: whiteTilesNormal
                    });
                    backWallMesh.material.setValues({
                        // roughnessMap:backWallRoughnessMap,
                        map: backWallDifuseMap,
                        normalScale: new THREE.Vector2(0.25, 0.25),
                        // normalMap: backWallNormalMap,
                        emissiveMap: backWallDifuseMap,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.06,
                        envMapIntensity: 0.2,
                        roughness:0.06,
                        color: 0xffffff,
                        metalness: 1.0
                    })
                    // floorOriginalMaterial.dispose();
                    renderer.renderLists.dispose();
            }

            if(child.name == 'portal'){
                portalPlane = child
                portalPlane.material = portalLightMaterial
                // portalPlane.rotation.x = Math.PI/2
              
            } 

            if(child.name == 'scss')
            {   
                
                scss = child
                scss.layers.enable(1)
              console.log('this is scss', scss)
              
               child.material = bakedNeonMaterial
              
            }
            if(child.name == 'blender')
            {
                blender = child
                blender.layers.enable(1)
             
               child.material = bakedNeonMaterial
            //    child.material.lightMapIntensity = 60 // intensity of baked light. 
            }
            if(child.name == 'javascript')
            {
                javascript = child
                javascript.layers.enable(1)
              
               child.material =bakedNeonMaterial
            //    child.material.lightMapIntensity = 60
            }
        }
    })


    // const portalMesh = gltf.scene.children.find((child)=> child.name === 'portal-plane')
    // const floorMesh = gltf.scene.children.find((child) => child.name === 'floor')
    // //  scene.add(floorMesh)
    
    //  leftWallMesh = gltf.scene.children.find((child)=> child.name === 'wall-left')
    //  rightWallMesh = gltf.scene.children.find((child) =>  child.name === 'wall-right')
    // const backWallMesh = gltf.scene.children.find((child) => child.name === 'back-wall')
    // portalMesh.material = portalLightMaterial
 

    /**
     * Add reflector material floor
     */
    
    // const floorOriginalMaterial = floorMesh.material;

    // console.log('this is just before adding reflective', floorMesh.material)
       
 
            // floorMesh.geometry.verticesNeedUpdate = true;
// floorMesh.geometry.normalsNeedUpdate = true;
// floorMesh.geometry.computeBoundingSphere();
// floorMesh.geometry.computeFaceNormals();
// floorMesh.geometry.computeVertexNormals();
            // floorOriginalMaterial.dispose();
            // renderer.renderLists.dispose();
            // floorMesh.material.envMap = environmentMap
            // floorMesh.geometry.normalizeNormals()
            // floorMesh.geometry.rotateX(3.14159)
    //   console.log('this is just after adding reflective', floorMesh.material)
            // scene.add(floorMesh)

/////// GUI
            function addReflectorFloor(){
                if (debug){
                    const reflectorFolder2 = gui.addFolder('floor')
                    reflectorFolder2.add(floorMesh.material, 'roughness').min(0).max(2).step(0.001)
                    reflectorFolder2.add(floorMesh.material, 'envMapIntensity').min(0).max(2).step(0.001)
                    reflectorFolder2.add(floorMesh.material, 'emissiveIntensity').min(0).max(2).step(0.001)
                    reflectorFolder2.add(floorMesh.material, 'metalness').min(0).max(2).step(0.001)
                    // reflectorFolder2.afloorMeshloor.material, 'color')
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'mixBlur').min(0).max(7).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'mixStrength').min(0).max(200).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'depthScale').min(0).max(20).step(0.1)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'mixContrast').min(0).max(7).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'minDepthThreshold').min(0).max(7).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'depthToBlurRatioBias').min(0).max(7).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'maxDepthThreshold').min(-5).max(7).step(0.001).onChange(function(){
                        // floorMesh.material.needsUpdate = true;
                    })
                }
            }
    
            addReflectorFloor()
       
            function addReflectorBackWall(){
                if (debug){
                    const reflectorFolder2 = gui.addFolder('right-wall')
                    reflectorFolder2.add(rightWallMesh.material, 'roughness').min(0).max(2).step(0.001)
                    reflectorFolder2.add(rightWallMesh.material, 'envMapIntensity').min(0).max(2).step(0.001)
                    reflectorFolder2.add(rightWallMesh.material, 'emissiveIntensity').min(0).max(2).step(0.001)
                    reflectorFolder2.add(rightWallMesh.material, 'metalness').min(0).max(2).step(0.001)
                    // reflectorFolder2.arightWallMeshloor.material, 'color')
                    reflectorFolder2.add(rightWallMesh.material.reflectorProps, 'mixBlur').min(0).max(7).step(0.001)
                    reflectorFolder2.add(rightWallMesh.material.reflectorProps, 'mixStrength').min(0).max(200).step(0.001)
                    reflectorFolder2.add(rightWallMesh.material.reflectorProps, 'depthScale').min(0).max(20).step(0.1)
                    reflectorFolder2.add(rightWallMesh.material.reflectorProps, 'mixContrast').min(0).max(7).step(0.001)
                    reflectorFolder2.add(rightWallMesh.material.reflectorProps, 'minDepthThreshold').min(0).max(7).step(0.001)
                    reflectorFolder2.add(rightWallMesh.material.reflectorProps, 'depthToBlurRatioBias').min(0).max(7).step(0.001)
                    reflectorFolder2.add(rightWallMesh.material.reflectorProps, 'maxDepthThreshold').min(-5).max(7).step(0.001).onChange(function(){
                        rightWallMesh.material.needsUpdate = true;
                    })
                }
            }
    
            addReflectorBackWall()

     /**
     * Add reflector material left wall 
     */



/**
 * Add reflector material right wall
 */


       
            scene.add(gltf.scene)     //     floorMesh.material.envMap = environmentMap


})



/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime

    if(model) {
//  console.log('floorMesh is updating')
 floorMesh.material.update()
 leftWallMesh.material.update()
 rightWallMesh.material.update()
 backWallMesh.material.update()




} 
if(scss && blender && javascript) 
{
    
    // scss.layers.enable(1) 
    // rightWallMesh.layers.enable(1)
    // fakeEmissionMesh.layers.set(1)
}


camera.layers.set(1)
effectComposer.render()
renderer.clearDepth()  
camera.layers.set(0)
renderer.render(scene, camera) 
//  effectComposer.render()
    // Update controls
if(controls) {
 controls.update()
}
    // Render
    // renderer.render(scene, camera) // paused due to the need for postprocessing 
   // the renderpass will add scene and camera

  
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
