/**
* Determines a color from the available color list based on a name.
*
* The sum of the name's character codes is used with the modulo operator
* to calculate a valid index within the colors array.
*
* @param name - The name used to determine the color.
* @returns The color assigned to the given name.
*/
export function getColor(name: string) {
    let sum = getChars(name);
    let colorIndex = sum % colors.length;
    return colors[colorIndex];
};

/**
* Calculates a numeric sum from the UTF-16 character codes of a name.
*
* Each character of the name is converted to its corresponding character
* code using `charCodeAt()` and added to the total sum.
*
* @param name - The name whose character codes should be summed.
* @returns The sum of all UTF-16 character codes of the name.
*/
export function getChars(name: string) {
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i)
    }
    return sum;
};

const colors = ["#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF745E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"];
