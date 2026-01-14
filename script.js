document.addEventListener('DOMContentLoaded', () => {
    const numGroupsInput = document.getElementById('num-groups');
    const groupStartsInput = document.getElementById('group-starts');
    const generateStartsBtn = document.getElementById('generate-starts');
    const generateBtn = document.getElementById('generate-btn');
    const outputSection = document.getElementById('output');
    const ctpFlagsDiv = document.getElementById('ctp-flags');
    const totalHoles = 24; // Sawmill fixed at 24

    const preferredHoles = [21, 1, 12, 23, 19, 10, 11, 13]; // TD on 21 first

    // Generate suggested starting holes based on # of groups
    generateStartsBtn.addEventListener('click', () => {
        const numGroups = parseInt(numGroupsInput.value);
        if (isNaN(numGroups) || numGroups < 1) return alert('Enter a valid number of groups.');

        const assigned = preferredHoles.slice(0, numGroups);
        groupStartsInput.value = assigned.join(', ');
    });

    // Generate flag assignments
    generateBtn.addEventListener('click', () => {
        const startsInput = groupStartsInput.value.trim();
        const groupStarts = startsInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        if (groupStarts.length === 0) return alert('Enter or generate starting holes.');

        const ctpInput = document.getElementById('ctp-holes').value.trim();
        const ctpHoles = ctpInput.split(',').map(h => parseInt(h.trim())).filter(n => !isNaN(n));
        if (ctpHoles.length === 0) return alert('Enter CTP holes.');

        const { bringOut, pickUp } = calculateFlagAssignments(groupStarts, ctpHoles);

        let html = '';
        for (let g = 1; g <= groupStarts.length; g++) {
            const takeOut = (bringOut[g] || []).sort((a, b) => a - b).join(', ') || 'None';
            const pick = (pickUp[g] || []).sort((a, b) => a - b).join(', ') || 'None';
            html += `
                <h4>Group ${g} (starts on hole ${groupStarts[g-1]})</h4>
                <p>Take out CTP flags: ${takeOut}</p>
                <p>Pick Up: ${pick}</p>
            `;
        }
        ctpFlagsDiv.innerHTML = html;

        outputSection.style.display = 'block';
    });

    function calculateFlagAssignments(groupStarts, ctpHoles) {
        const bringOut = {};
        const pickUp = {};
        for (let i = 1; i <= groupStarts.length; i++) {
            bringOut[i] = [];
            pickUp[i] = [];
        }

        ctpHoles.forEach(ctp => {
            let minDist = Infinity;
            let maxDist = -Infinity;
            let firstG = -1;
            let lastG = -1;
            groupStarts.forEach((start, idx) => {
                let dist = (ctp - start + totalHoles) % totalHoles;
                if (dist < minDist) {
                    minDist = dist;
                    firstG = idx + 1;
                }
                if (dist > maxDist) {
                    maxDist = dist;
                    lastG = idx + 1;
                }
            });
            if (firstG !== -1) bringOut[firstG].push(ctp);
            if (lastG !== -1) pickUp[lastG].push(ctp);
        });

        return { bringOut, pickUp };
    }
});
