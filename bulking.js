/**
 * This variable is returned from all of the form submission handlers 
 * because returning false from a javascript form will prevent the 
 * page form reloading.
 */
const PREVENT_PAGE_RELOAD = false;
 
/**
 * Class used to represent the different bulking approaches 
 * recommended in the article. conservative, moderate and aggressive.
 */
class BulkingApproach{
 
    /**
     * Constructor assumes all parameters are valid and does no
     * checking for object types or errors.
     * 
     * @param name name of the bulking approach
     * @param rangeConstants upper and lower bounds of the range to 
     *                          augment TDEE by to calculate surplus.
     */
    constructor(name,rangeConstants){
        this.name = name;
        this.rangeConstants = rangeConstants;
    }
 
    /**
     * Calculates a surplus range that is personalized to the TDEE 
     * supplied to this function. If the TDEE is not a number, null
     * or an error occurs in the function then a default response 
     * is returned. Otherwise the TDEE is added to the upper and 
     * lower bounds of the range for this bulking approach.
     * 
     * @param tdee Maintenance calories used to calculate the surplus ranges. 
     */
    getPersonalRange(tdee) {
       const defaultResponse = "TDEE + [" + this.rangeConstants + "] kcal";
       if(isNaN(tdee) || !tdee ){
           return defaultResponse;
       }
       try{
        const personalizedRange = this.rangeConstants.map( rangeConst=>rangeConst+tdee);
        return  ( "[" + personalizedRange + "] kcal" );
       }catch(error){
           return defaultResponse;
       }
    }
 
}
 
/**
* Range to augment TDEE by to calculate a conservative surplus.
*/
const CONSERVATIVE_SURPLUS_RANGE = new BulkingApproach("Conservative",[100,250]);
 
/**
 * Range to augment TDEE by to calculate a moderate surplus.
 */
const MODERATE_SURPLUS_RANGE = new BulkingApproach("Moderate",[250, 500]);
 
/**
 * Range to augment TDEE by to calculate an aggressive surplus.
 */
const AGGRESSIVE_SURPLUS_RANGE = new BulkingApproach("Aggressive",[500,750]);
 
/**
 * List of all the recommended bulking approaches and their range constants.
 */
const RECCOMENDED_RANGES = [ 
    CONSERVATIVE_SURPLUS_RANGE,
    MODERATE_SURPLUS_RANGE,
    AGGRESSIVE_SURPLUS_RANGE
];
 
 
/**
 * Sets the value of the surplus range calculator table that displays the 
 * personalized surplus ranges so that users can follow along with the 
 * article. This function does not require that the TDEE be a number or 
 * not null.
 * 
 * @param tdee Maintenance calories used to calculate the surplus ranges. 
 */
function setRangeTable(tdee){
    const personalRanges = RECCOMENDED_RANGES.map(range=> {
        return {
            name:range.name,
            personalizedRange:range.getPersonalRange(tdee)
        };
    });
    personalRanges.forEach( personalRange => {
        const valueOfIdAttribute = ("personal"+personalRange.name+"Range");
        const rangeCellInTable = document.getElementById(valueOfIdAttribute);
        if( rangeCellInTable ){
            rangeCellInTable.innerHTML = personalRange.personalizedRange;
        }
    });
}
 
 
/**
 * Form submission handler for the bulking intake range calculator.
 * Converts the user's input for maintenance kcal into a whole number
 * and populates the table containing the personalized bulking intake 
 * ranges.
 */
function handleRangeCalculatorSubmission(){
    let tdee = document.getElementById("maintenanceKcals").value
    const canCleanTDEE = !(tdee==null);
    if(canCleanTDEE){
        tdee = parseInt(tdee);
        tdee = Math.round(tdee);
    }
    setRangeTable(tdee);
    return PREVENT_PAGE_RELOAD;
}
 
/**
 * Handles setting the initial state of all forms on the page.
 * If this function is not called, the forms are designed 
 * so they will not break.
 */
function setUpPageFormsInitialState(){
    setRangeTable(null);
}
 
/**
 * Waits for DOM to load before calling any setup functions.
 */
document.addEventListener("DOMContentLoaded", setUpPageFormsInitialState);
