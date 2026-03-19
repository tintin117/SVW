const screens = [
    {
        id: "select",
        label: "Discover",
        heading: "Meet the Sunda Pangolin",
        subheading: "One of the most elusive and extraordinarily unique mammals on Earth, the Sunda Pangolin calls the forests of Southeast Asia home. Characterized by its armor of keratin scales, it is the only mammal fully covered in them.",
        instruction: "Tap 'Ecosystem' to learn about their vital role in our forests."
    },
    {
        id: "species",
        label: "Ecosystem",
        heading: "Nature's Pest Controllers",
        subheading: "A single pangolin can consume up to 70 million insects a year. By regulating ant and termite populations, they protect vast tracts of forest from destruction and naturally aerate the soil as they dig.",
        instruction: "Their existence is vital, yet they face severe dangers. Tap 'Threats'."
    },
    {
        id: "threats",
        label: "Threats",
        heading: "The Most Trafficked Mammal",
        subheading: "Driven by illegal wildlife trade, the Sunda Pangolin is hunted relentlessly for its meat and scales. Habitat loss due to rapid deforestation further pushes this remarkable species toward the brink of extinction.",
        instruction: "What happens when pangolins disappear? Tap 'Consequence 1'."
    },
    {
        id: "impact1",
        label: "Impact 1",
        heading: "Insect Population Explosion",
        subheading: "Without pangolins acting as natural regulators, termite and ant populations surge uncontrollably. This immediate disruption alters the delicate balance of the forest floor ecosystem.",
        instruction: "The chain reaction continues. Tap 'Impact 2'."
    },
    {
        id: "impact2",
        label: "Impact 2",
        heading: "Forest Degradation",
        subheading: "Overpopulated insects consume roots and timber at an alarming rate. Combined with the lack of soil aeration from pangolin foraging, the local flora begins to suffer, weakening the forest's health.",
        instruction: "This leads to severe outcomes. Tap 'Impact 3'."
    },
    {
        id: "impact3",
        label: "Impact 3",
        heading: "Systemic Ecological Collapse",
        subheading: "As the forest degrades, other animal species lose their habitats and food sources. The removal of a single keystone species like the pangolin can trigger an irreversible collapse of the entire local ecosystem.",
        instruction: "We can still change this narrative. Tap 'Human Role'."
    },
    {
        id: "human",
        label: "Human Role",
        heading: "Our Responsibility & Action",
        subheading: "We have the power to stop the illegal trade. By supporting conservation efforts, raising awareness, and protecting their natural habitats, we can ensure the Sunda Pangolin thrives for generations to come.",
        instruction: "Join Save Vietnam's Wildlife today. Your voice matters."
    }
];

// DOM Elements
const mainHeading = document.getElementById("main-heading");
const subHeading = document.getElementById("sub-heading");
const instructionText = document.getElementById("instruction-text");

const navPillsContainer = document.getElementById("nav-pills");
const stepperNodesContainer = document.getElementById("stepper-nodes");
const stepperProgress = document.getElementById("stepper-progress");

function init() {
    renderStepper();
    renderNavPills();
    loadScreen(0);
}

function renderStepper() {
    stepperNodesContainer.innerHTML = "";
    screens.forEach((screen, index) => {
        const node = document.createElement("div");
        node.className = "step-node";
        node.id = `step-node-${index}`;
        stepperNodesContainer.appendChild(node);
    });
}

function renderNavPills() {
    navPillsContainer.innerHTML = "";
    screens.forEach((screen, index) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.className = "nav-pill";
        btn.id = `nav-pill-${index}`;
        btn.textContent = screen.label;
        btn.onclick = () => loadScreen(index);
        
        li.appendChild(btn);
        navPillsContainer.appendChild(li);
    });
}

function animateTextChange(element, newText) {
    element.classList.remove("fade-in-up");
    void element.offsetWidth; // Force reflow
    element.textContent = newText;
    element.classList.add("fade-in-up");
}

function updateStepperAndNav(index) {
    // Nav Pills Active State
    document.querySelectorAll(".nav-pill").forEach((pill, i) => {
        if (i === index) pill.classList.add("active");
        else pill.classList.remove("active");
    });

    // Stepper Progress Line
    const totalSteps = screens.length - 1; 
    const progressPercentage = (index / totalSteps) * 100;
    stepperProgress.style.width = `${progressPercentage}%`;

    // Stepper Nodes
    document.querySelectorAll(".step-node").forEach((node, i) => {
        node.classList.remove("active", "completed");
        if (i < index) {
            node.classList.add("completed");
        } else if (i === index) {
            node.classList.add("active");
        }
    });

    // Optionally: Subtle parallax/animation effect on pangolin image per slide
    const img = document.querySelector(".pangolin-art");
    if(img) {
        // Just a slight scale/rotation shift to make it feel alive per step
        img.style.transform = `scale(${1 + index * 0.02}) rotate(${index * 1.5}deg)`;
        img.style.transition = "transform 1s cubic-bezier(0.16, 1, 0.3, 1)";
    }
}

function loadScreen(index) {
    if (index < 0 || index >= screens.length) return;
    
    const data = screens[index];

    animateTextChange(mainHeading, data.heading);
    animateTextChange(subHeading, data.subheading);
    animateTextChange(instructionText, data.instruction);
    
    updateStepperAndNav(index);
}

document.addEventListener("DOMContentLoaded", init);
