document.addEventListener('DOMContentLoaded', () => {
    const numGroupsInput = document.getElementById('num-groups');
    const groupStartsInput = document.getElementById('group-starts');
    const generateStartsBtn = document.getElementById('generate-starts');
    const generateBtn = document.getElementById('generate-btn');
    const outputSection = document.getElementById('output');
    const ctpFlagsDiv = document.getElementById('ctp-flags');
    const totalHoles = 24;

    // Your preferred starting hole order (TD always 21 first)
    const preferredOrder = [21, 1, 12, 23, 19, 10, 11, 13];

    // Minimum hole separation between starting positions (1 = at least one hole gap)
    const MIN_SEPARATION = 2;  // Change to 3 if you want even more space

    // Generate starting holes following your preferred order + separation rule
    generateStartsBtn.addEventListener('click', () => {
        const numGroups = parseInt(numGroupsInput.value);
        if (isNaN(numGroups) || numGroups < 1) return alert('Enter a valid number of groups.');

        const starts = suggestStartingHoles(numGroups);
        groupStartsInput.value = starts.join(', ');
    });

    // Generate flag assignments (groups sorted by starting hole, CTP holes sorted ascending)
    generateBtn.addEventListener('click', () => {
        const startsInput = groupStartsInput.value.trim();
        let groupStarts = startsInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        if (groupStarts.length === 0) return alert('Enter or generate starting holes.');

        // Sort starting holes ascending for clean output
        groupStarts.sort((a, b) => a - b);

        const ctpInput = document.getElementById('ctp-holes').value.trim();
        const ctpHoles = ctpInput.split(',').map(h => parseInt(h.trim())).filter(n => !isNaN(n));
        if (ctpHoles.length === 0) return alert('Enter CTP holes.');

        const { bringOut, pickUp } = calculateFlagAssignments(groupStarts, ctpHoles);

        let html = '';
        groupStarts.forEach((startHole, idx) => {
            const g = idx + 1;
            const takeOutSorted = (bringOut[g] || []).sort((a, b) => a - b).join(', ') || 'None';
            const pickUpSorted = (pickUp[g] || []).sort((a, b) => a - b).join(', ') || 'None';

            html += `
                <h4>Group ${g} (starts on hole ${startHole})</h4>
                <p>Take out CTP flags: ${takeOutSorted}</p>
                <p>Pick Up: ${pickUpSorted}</p>
            `;
        });

        ctpFlagsDiv.innerHTML = html;
        outputSection.style.display = 'block';
    });

    // Suggest starting holes: prioritize preferred order, enforce separation
    function suggestStartingHoles(numGroups) {
        let starts = [];
        let used = new Set();

        // Add preferred holes in your desired sequence, if they fit separation
        for (let hole of preferredOrder) {
            if (starts.length >= numGroups) break;
            if (used.has(hole)) continue;

            let valid = true;
            for (let u of used) {
                let dist = Math.min(Math.abs(hole - u), totalHoles - Math.abs(hole - u));
                if (dist < MIN_SEPARATION) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                starts.push(hole);
                used.add(hole);
            }
        }

        // Fill remaining slots with any hole that satisfies separation
        for (let hole = 1; hole <= totalHoles; hole++) {
            if (starts.length >= numGroups) break;
            if (used.has(hole)) continue;

            let valid = true;
            for (let u of used) {
                let dist = Math.min(Math.abs(hole - u), totalHoles - Math.abs(hole - u));
                if (dist < MIN_SEPARATION) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                starts.push(hole);
                used.add(hole);
            }
        }

        // Final sort ascending for display
        return starts.sort((a, b) => a - b);
    }

    // Flag assignment calculation (unchanged)
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
