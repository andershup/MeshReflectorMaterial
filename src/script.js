import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import portalVertexShader from '../static/shaders/portal/vertex.glsl'
import portalFragmentShader from '../static/shaders/portal/fragment.glsl'
import { gsap } from 'gsap'
import  MeshReflectorMaterial  from '../static/shaders/MeshReflectorMaterial';
import { DoubleSide, LoadingManager } from 'three'

//Texture load


/**
 * Base
 */
// Debug


// Debug
let debug = true
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


let models = null
let  floorMesh = null 
let leftWallMesh = null
let rightWallMesh = null

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );


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
})


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LIGHTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.1)
scene.add(pointLight)
pointLight.position.set(0,3,0)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)



////////////////////////////////////////////////////////////////////////////////
//CAMERA
////////////////////////////////////////////////////////////////////////////////
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 8, 10)
scene.add(camera)
////////////////////////////////////////////////////////////////////////////////
// Controls
///////////////////////////////////////////////////////////////////////////////
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true



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


/////////////////////////////////////////////////////////////////////////////////
//RENDERER
//////////////////////////////////////////////////////////////////////////////////
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true, 
    powerPreference: "high-performance" 
})
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.autoClear = true;
renderer.setPixelRatio(2); //Performance
renderer.setSize(window.innerWidth, window.innerHeight);


/////////////////////////////////////////////////////////////////////////////////
//TEXTURE LOADER
////////////////////////////////////////////////////////////////////////////////


const textureLoader = new THREE.TextureLoader(loadingManager)

const floorColorTexture = textureLoader.load('/textures/floor-and-walls/BathroomTiles01_4K_BaseColor.png')
const floorRoughnessTexture = textureLoader.load('/textures/floor-and-walls/BathroomTiles01_4K_Roughness.png')
const floorNormalTexture = textureLoader.load('/textures/floor-and-walls/BathroomTiles01_4K_Normal.png')



floorColorTexture.repeat.x = 4
floorColorTexture.repeat.y = 2
floorColorTexture.wrapS = THREE.RepeatWrapping
floorColorTexture.wrapT = THREE.RepeatWrapping
// floorColorTexture.rotation = 1
// floorColorTexture.needsUpdate = true


const graniteDifuse = textureLoader.load('./textures/reflecting-material/Granite08large_MR_1K/Granite08large_1K_BaseColor.png')
const graniteRoughness = textureLoader.load('./textures/reflecting-material/Granite08large_MR_1K/Granite08large_1K_Roughness.png')
const graniteNormal = textureLoader.load('./textures/reflecting-material/Granite08large_MR_1K/Granite08large_1K_Normal.png')
const whiteTilesDifuse = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_BaseColor.png')
const whiteTilesRoughness = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_Roughness.png')
const whiteTilesNormal = textureLoader.load('./textures/reflecting-material/StoneTilesFloor03_MR_1K/StoneTilesFloor03_1K_Normal.png')
// floorNormalTexture.matrixAutoUpdate = true

whiteTilesDifuse.repeat.x = 2
whiteTilesDifuse.repeat.y = 2
whiteTilesDifuse.wrapS = THREE.RepeatWrapping
whiteTilesDifuse.wrapT = THREE.RepeatWrapping


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


///////////////////////////////////////////////////////////////
///// PORTAL 
////////////////////////////////////////////////////////////


debugObject.portalColorStart = '#ff0000'
debugObject.portalColorEnd = '#09ec60'

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

//// LEFT PORTAL
const portal = new THREE.Mesh(
    new THREE.PlaneGeometry(5,5),
    new THREE.MeshStandardMaterial({
        // color: 'white',
        // emissive: 'white',
        // envMap: environmentMap

    })
)

portal.material = portalLightMaterial
portal.position.set(-8,2,0)
scene.add(portal)



/////////////////////////////////////////////////
///// NATIVE MATERIAL RAISED FLOOR TESTER
//////////////////////////////////////////////
const nativeFloorGeometry = new THREE.PlaneGeometry(4,16,1)
const nativeFloorMaterial = new THREE.MeshStandardMaterial()
const nativeFloor = new THREE.Mesh(nativeFloorGeometry,nativeFloorMaterial)
scene.add(nativeFloor)
nativeFloor.rotation.x = - Math.PI /2
nativeFloor.position.set(-5,2,-6)

// Adding reflective material 
nativeFloor.material = new MeshReflectorMaterial(renderer, camera, scene, nativeFloor,
    {
        resolution: 512,
        blur: [1024,1024],
        mixStrength: 1,
        planeNormal: new THREE.Vector3(0, 0, 1),
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
    nativeFloor.material.setValues({
        // roughnessMap:floorRoughnessTexture,
        map: whiteTilesDifuse,
        normalScale: new THREE.Vector2(0.25, 0.25),
        normalMap: whiteTilesNormal,
        emissiveMap: whiteTilesDifuse,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.6,
        envMapIntensity: 0.2,
        roughness:0.2,
        color: 0xffffff,
        metalness: 0.1,
        side: THREE.DoubleSide
    })
    // floorMesh.geometry.verticesNeedUpdate = true;
// floorMesh.geometry.normalsNeedUpdate = true;
// floorMesh.geometry.computeBoundingSphere();
// floorMesh.geometry.computeFaceNormals();
// floorMesh.geometry.computeVertexNormals();
    // floorOriginalMaterial.dispose();
    // renderer.renderLists.dispose();

    console.log('this is the native test floor after adding relective', nativeFloor)

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GUI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



if(debug) {
function lightsGUI() {
    if(debug) {
        const lightsFolder = gui.addFolder('Lights')
        lightsFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.01).name('lightIntensity')
        lightsFolder.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('lightDirectionX')
        lightsFolder.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('lightDirectionY')
        lightsFolder.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('lightDirectionZ')
      

    }
}
lightsGUI()
}


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
    './models/cinema-trial-setup-with-no-materials.glb',
    (gltf) =>
    {
     
       
    gltf.scene.traverse((model) => {
        if(model.isMesh) {
            if(model.name == 'floor') 
            {
                floorMesh = model
                floorMesh.material = new MeshReflectorMaterial(renderer, camera, scene, floorMesh,
                    {
                        resolution: 512,
                        blur: [1024,1024],
                        mixStrength: 1,
                        planeNormal: new THREE.Vector3(0, 0, 1),
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
                        // roughnessMap:floorRoughnessTexture,
                        map: whiteTilesDifuse,
                        normalScale: new THREE.Vector2(0.25, 0.25),
                        normalMap: whiteTilesNormal,
                        emissiveMap: whiteTilesDifuse,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.6,
                        envMapIntensity: 0.2,
                        roughness:0.2,
                        color: 0xffffff,
                        metalness: 0.1,
                        side: THREE.FrontSide
                    })
            }
            if(model.name == 'wall-left') 
            {
                leftWallMesh = model
                leftWallMesh.material = new MeshReflectorMaterial(renderer, camera, scene, leftWallMesh,
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
                    leftWallMesh.material.setValues({
                        roughnessMap:floorRoughnessTexture,
                        map: floorColorTexture,
                        normalScale: new THREE.Vector2(0.25, 0.25),
                        normalMap: floorNormalTexture,
                        emissiveMap: floorColorTexture,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.6,
                        envMapIntensity: 0.2,
                        roughness:0.6,
                        color: 0xffffff,
                        metalness: 0.1
                    })
                    // floorOriginalMaterial.dispose();
                    renderer.renderLists.dispose();
            }
            if(model.name == 'wall-right') 
            {
                rightWallMesh = model
                rightWallMesh.material = new MeshReflectorMaterial(renderer, camera, scene, rightWallMesh,
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
                    rightWallMesh.material.setValues({
                        roughnessMap:floorRoughnessTexture,
                        map: floorColorTexture,
                        normalScale: new THREE.Vector2(0.25, 0.25),
                        normalMap: floorNormalTexture,
                        emissiveMap: floorColorTexture,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.6,
                        envMapIntensity: 0.2,
                        roughness:0.6,
                        color: 0xffffff,
                        metalness: 0.1
                    })
                    // floorOriginalMaterial.dispose();
                    // renderer.renderLists.dispose();
            }
            if(model.name == 'portal-plane') model.material = portalLightMaterial
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
                    // reflectorFolder2.addColor(floor.material, 'color')
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'mixBlur').min(0).max(7).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'mixStrength').min(0).max(200).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'depthScale').min(0).max(20).step(0.1)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'mixContrast').min(0).max(7).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'minDepthThreshold').min(0).max(7).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'depthToBlurRatioBias').min(0).max(7).step(0.001)
                    reflectorFolder2.add(floorMesh.material.reflectorProps, 'maxDepthThreshold').min(-5).max(7).step(0.001).onChange(function(){
                        floorMesh.material.needsUpdate = true;
                    })
                }
            }
    
            addReflectorFloor()

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

    if(floorMesh) {
//  console.log('floorMesh is updating')
 floorMesh.material.update()
}
nativeFloor.material.update()



 
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
