import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//lenis
const lenis = new Lenis()

lenis.on('scroll', (e) => {
    console.log(e)
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

//cursor
{
    const cursor = document.querySelector('.cursor')
    const cursor1 = document.querySelector('.cursor1')
    window.addEventListener('mousemove', (e) => {
        let a = 45;
        console.log(e);

        gsap.to(cursor, {
            x: e.x - a,
            y: e.y - a
        })
        gsap.to(cursor1, {
            x: e.x - a,
            y: e.y - a
        })
    })
}
const page2 = document.querySelector('.page2')
page2.addEventListener('mouseleave', () => {
    const cursor1 = document.querySelector('.cursor1')
    cursor1.style.display = 'none'
})
page2.addEventListener('mouseenter', () => {
    const cursor1 = document.querySelector('.cursor1')
    cursor1.style.display = 'flex'
})
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};


loadingManager.onLoad = function () {
    console.log('Loading complete!');
};

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

loadingManager.onError = function (url) {
    // console.log('There was an error loading ' + url);
    alert('There was an error loading ' + url)
};



let model = null;
function renderModel(modelPath, container) {

    let containerEl = document.querySelector(`#${container}`)
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, containerEl.clientWidth / containerEl.clientHeight, 0.5, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);
    containerEl.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;

    controls.update();


    const loader = new GLTFLoader(loadingManager);


    loader.load(modelPath, function (gltf) {

        model = gltf.scene;

        if (modelPath == 'WhiteCan.glb') {
            model.position.set(0, -.9, 0);
            model.scale.set(.45, .45, .45);
        }
        if (modelPath == 'redCan.glb') {
            model.position.set(0, -.7, 0);
            model.scale.set(0.0047, 0.0047, 0.0047);
            model.rotation.y = 185 * (Math.PI / 180);

        }
        if (modelPath == 'blackCan.glb') {
            model.scale.set(.37, .37, .37);
            model.position.set(0, -.8, 0);
        }

        model.traverse((child) => {
            if (child.isMesh) {
                const material = child.material;
                material.metalness = 0.9;
                material.roughness = 0.2;
            }
        });
        scene.add(model)
        animate()

        gsap.to(model.rotation, {
            x: 90 * (Math.PI / 180),
            scrollTrigger: {
                trigger: containerEl,
                start: "top top",
                end: "bottom top",
                scrub: 1,
            }
        });

        gsap.to(model.position, {
            x: "8", // Move right by 10 units
            z: "-2", // Move out of the screen
            scrollTrigger: {
                trigger: containerEl,
                start: "top top",
                end: "bottom top",
                scrub: 1,
            }
        });


    }, undefined, function (error) {
        console.error(error);
    });

    //light follow
    const directionalLightd = new THREE.DirectionalLight(0xffffff, 2);
    scene.add(directionalLightd);
    // Track the cursor position
    let mouse = new THREE.Vector2();
    containerEl.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Create a raycaster
    const raycaster = new THREE.Raycaster();

    function onMouseMove() {
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObject(new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({ visible: false })));

        if (intersects.length > 0) {
            // Get the intersected point
            const point = intersects[0].point;

            // Move the light to the intersected point
            directionalLightd.position.set(point.x, point.y, point.z);
        }
    }




    {
        const light = new THREE.AmbientLight(0xffffff, 5);
        light.position.set(1, 1, 1);
        scene.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 14);
        directionalLight.position.set(-1, 1, 1);
        scene.add(directionalLight);


        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 13);
        directionalLight2.position.set(1, 2, 0);
        scene.add(directionalLight2);

        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 6);
        directionalLight3.position.set(0, .5, -1);
        scene.add(directionalLight3);

        const directionalLight4 = new THREE.DirectionalLight(0xffffff, 12);
        directionalLight4.position.set(1, 0, 3);
        scene.add(directionalLight4);

        // const directionalLight5 = new THREE.DirectionalLight(0xffffff, 16);
        // directionalLight5.position.set(-1, .5, 1);
        // scene.add(directionalLight5);
    }
    function animate() {
        if (!model) {
            requestAnimationFrame(animate); // Wait for the model to load
            return;
        }
        requestAnimationFrame(animate)
        controls.update();
        onMouseMove();
        // gsap.to(model.rotation, {
        //     y: "+=1.08319", // Rotate by 2*PI (360 degrees)
        //     duration: 5,
        //     repeat: -1, // Infinite loop
        //     ease: "none" // Linear easing for continuous rotation
        // });
        renderer.render(scene, camera)

    }
    animate()
    window.addEventListener('resize', () => {
        camera.aspect = containerEl.clientWidth / containerEl.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);
    });
}
renderModel('WhiteCan.glb', 'page6rightId')
renderModel('blackCan.glb', 'hero')


document.addEventListener('wheel', (e) => {
    let con = document.querySelectorAll('.con');
    let i = document.querySelectorAll('.con i');
    if (e.deltaY < 0) {

        gsap.to(i, {
            rotateY: '0deg',
            duration: 1
        })
        gsap.fromTo(con,
            {
                x: '-100%'
            },
            {
                x: '0%',
                duration: 13,
                repeat: -1,
                ease: "none"
            });
    } else {
        gsap.to(i, {
            rotateY: '180deg',
            duration: 1
        })
        gsap.fromTo(con,
            {
                x: '0%'
            },
            {
                x: '-100%',
                duration: 13,
                repeat: -1,
                ease: "none"
            });
    }
});


//menu


document.querySelector('.menuDiv').addEventListener('click', menuToggle)

// menuIcon 
let flag = true;

function menuToggle() {
    console.log('k');

    let line1 = document.querySelector('.line1')
    let line2 = document.querySelector('.line2')
    let line3 = document.querySelector('.line3')
    // let slideBar = document.querySelector('.slideBar')
    let timeline = gsap.timeline();

    if (flag) {
        line1.style.display = 'none'
        line2.style.width = '82%'
        line2.style.transform = 'translate(-50%,0px) rotate(-45deg)';
        line3.style.transform = 'translate(-50%,0px) rotate(45deg)';
        line3.style.width = '82%'
        flag = false;

        timeline.to('.slideBar', {
            right: '0%',
            opacity: 1,
            duration: .6
        })
        timeline.from('.slideBar h3', {
            x: 400,
            opacity: 1,
            duration: .6,
            stagger: 0.10
        })
    }
    else {
        line1.style.display = 'block'
        line2.style.width = '60%'
        line2.style.transform = 'translate(-50%,-9px) rotate(0deg)';
        line3.style.transform = 'translate(-50%,6px) rotate(0deg)';
        line3.style.width = '60%'
        flag = true;
        gsap.to('.slideBar', {
            right: '-32%',
            opacity: 0,
            duration: 1
        })
    }

}



//carousel
let currentIndex = 0;
console.log(currentIndex);
let itemWidth = 0;


document.querySelector('.rightbtn').addEventListener('click', () => {

    let imgDiv = document.querySelector('.imgDiv')
    let computedStyle = window.getComputedStyle(imgDiv)
    itemWidth = parseFloat(computedStyle.minWidth); // Convert to number


    if (itemWidth < 90) {
        currentIndex = 0;
    }
    else {

        if (currentIndex >= 1) {
            currentIndex = -1;
        } else {
            currentIndex++;
        }
    }
    console.log(currentIndex, 'r8');
    console.log(itemWidth);

    itemWidth = -currentIndex * itemWidth
    console.log(itemWidth);

    document.querySelector('.imageDiv').style.transform = `translateX(${itemWidth}%)`;
});

document.querySelector('.leftbtn').addEventListener('click', () => {
    let imgDiv = document.querySelector('.imgDiv')
    let computedStyle = window.getComputedStyle(imgDiv)
    itemWidth = parseFloat(computedStyle.minWidth); // Convert to number

    if (itemWidth < 90) {
        currentIndex = 0;
    } else {
        if (currentIndex <= -1) {
            currentIndex = 1;
        } else {
            currentIndex--;
        }
    }
    console.log(currentIndex, 'l8');

    console.log(computedStyle.minWidth);

    itemWidth = -currentIndex * itemWidth
    console.log(itemWidth);
    document.querySelector('.imageDiv').style.transform = `translateX(${itemWidth}%)`;
});

//animations
gsap.to(".carousel", {
    scale: 0.9,
    duration: 2,
    scrollTrigger: {
        trigger: ".page2",
        start: "50% 10%",
        end: "bottom 65%",
        scrub: true,
        // markers: true,
        pin: true
    }
});

gsap.to(".imgDiv", {
    height: '40%',
    minWidth: '33%',
    scrollTrigger: {
        trigger: ".page2",
        start: "50% 10%",
        end: "bottom 45%",
        scrub: true,
        // markers: true,
        pin: true
    }
});

gsap.to(".page4 video", {
    width: '100%',
    duration: 2,
    scrollTrigger: {
        trigger: ".page4",
        start: "8% 75%",
        end: "25% 78%",
        scrub: true,
        ease: "power2.in",
    }
});

gsap.from(".page5 h1", {
    y: 200,
    duration: 3,
    opacity: 0,
    stagger: 1,
    scrollTrigger: {
        trigger: ".page5",
        start: "45% center",
        end: "55% 55%",
        scrub: 1,
        // markers: true,
    }
});


gsap.to(".page6left .spanhead,.secondspan", {
    width: '100%',
    scrollTrigger: {
        trigger: ".page6",
        start: "15% 75%",
        end: "45% 55%",
        scrub: 1,
    }
});


const p = document.querySelector('.page6left p');
let splittedText = p.textContent.split(' ')


let returnS = splittedText.map(word => {
    return word.trim() ? `<span class='pspan'>${word}</span>` : null;
}).filter(word => word !== null)


p.innerHTML = returnS.join(' ');

gsap.to(".page6left .pspan", {
    opacity: 1,
    stagger: 0.3,
    scrollTrigger: {
        trigger: ".page6",
        start: "27% 65%",
        end: "60% 70%",
        scrub: 1,
    }
});



const tl = gsap.timeline();


tl.from(['.sprite', '.water', '.coffee', '.pulp'], {
    top: '100%',
    left: '100%',
    duration: 10,
    stagger: {
        each: 5 // Adjust the stagger value as needed
    },
    scrollTrigger: {
        trigger: ".page5",
        start: "30% 60%",
        end: "60% 65%",
        // markers: true,
        scrub: 1,
        ease: "power2.in",
        toggleActions: "play none none reset"
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.page4 video')

    const handleScroll = () => {
        const page3 = document.querySelector('.page4')
        const rect = page3.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
            video.play();
        } else {
            video.pause();
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
});


//playvideo on hvr
document.addEventListener("DOMContentLoaded", function () {
    const hoverVideoContainer = document.querySelector(".page6left");
    const hoverVideo = document.getElementById("dietcokevideo");

    hoverVideoContainer.addEventListener("mouseenter", function () {
        gsap.to(hoverVideo, {
            duration: 1,
            opacity: 1,
        })
        gsap.set(hoverVideo, {
            display: 'block'
        })
        hoverVideo.play(); // Play the video
    });

    hoverVideoContainer.addEventListener("mouseleave", function () {
        gsap.to(hoverVideo, {
            duration: 1.5, opacity: 0, onStart: () => {
                hoverVideo.style.display = "none"; // Show the video
            }
        })
        hoverVideo.pause(); // Pause the video
        hoverVideo.currentTime = 0; // Reset the video to the beginning
    });
});

//footer string

var path = `M 20 100 Q 750 100 1490 100`;

var finalPath = `M 20 100 Q 750 100 1490 100`

let Strings = document.getElementById('string');

Strings.addEventListener('mousemove', function (details) {
    console.log(details.y);
    path = `M 20 100 Q 750 ${details.y} 1490 100`;
    gsap.to('svg path', {
        attr: {
            d: path,
        },
        duration: 0.3,
        ease: 'power3.out'
    })
})

Strings.addEventListener('mouseleave', function () {
    gsap.to('svg path', {
        attr: {
            d: finalPath
        },
        duration: 1.5,
        ease: 'elastic.out(1,0.2)'
    })
})




