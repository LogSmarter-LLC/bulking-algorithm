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
 * Number of lbs, that when the user's change in body weight is below or equal to, 
 * they will be considered to have maintained their weight.
 */
const WEIGHT_MAINTENANCE_THRESHOLD = 1;

/**
 * Rate of weight change per week in % of total starting body weight represents an inclusive
 * [min,max] range where weekly change in % body weight is optimal. Should Divide by 100 if
 * using in calculations to get as a %. This is the maximum rate that is still considered
 * optimal for bulking. Optinally could multiply the decimal being compared to by 100.
 */
const MAX_BULK_RATE = 0.375;

/**
 * This is the minimum rate of weight change per week in % of total starting body weight
 * that is still considered optimal for bulking.
 */
const MIN_BULK_RATE = 0.0625;
 
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
 * Form submission handler for rate of weight gain calculator.
 * First checks if the rate of weight gain can be calculated.
 * If it can then the user is told whether they are gaining
 * fast, slow or optimally. Othewrise the user is told 
 * if they are losing weight, have maintained their weight or
 * some type of error has occured. This message is then displayed 
 * below the rate of weight gain calculator.
 */
function handleRateOfWeightGainCalculatorSubmission(){
    const startWeight = document.getElementById("startWeight").value;
    const currentWeight = document.getElementById("currentWeight").value;
    const numWeeksBulking = document.getElementById("weeksBulking").value;
    const allInputs = [startWeight,currentWeight,numWeeksBulking];
    const allInputsAreValidNumbers = !(allInputs.find(input => {
        const inputIsNull = (input == null);
        const inputIsNotANumber = isNaN(input);
        const cannotCalc = (inputIsNull || inputIsNotANumber );
           return cannotCalc;
    }));
    let defaultRateString = "Enter a valid start weight, current weight and number of weeks to check if you rate of weight gain is optimal."
    let rateOfWeightGainMessage;
    if(allInputsAreValidNumbers){
        try{
            const deltaWeight = startWeight-currentWeight;
            const absDeltaWeight = Math.abs(deltaWeight);
            const hasMaintained = absDeltaWeight <= WEIGHT_MAINTENANCE_THRESHOLD;
            const hasGained = (!hasMaintained && deltaWeight < 0);
            const hasLost = (!hasMaintained && deltaWeight > 0);
            if(hasMaintained){
                rateOfWeightGainMessage = "You have roughly maintained your weight. No rate of weight gain to analyze."
            }
            else if( hasLost){
                rateOfWeightGainMessage = "You have lost weight. No rate of weight gain to analyze."
            }
            else if(hasGained){
                const weeklyAbsDelta = (absDeltaWeight / numWeeksBulking);
                const rateOfWeightGainPerWeekPercent = (weeklyAbsDelta / startWeight)*100;
                const isFast = rateOfWeightGainPerWeekPercent > MAX_BULK_RATE;
                const isSlow = rateOfWeightGainPerWeekPercent < MIN_BULK_RATE;
                const isOptimal = (!isFast && !isSlow)
                rateOfWeightGainMessage = "Your rate of weight gain for your bulk is considered "
                if(isSlow){
                    rateOfWeightGainMessage += "slow";
                }
                else if( isFast){
                    rateOfWeightGainMessage += "fast";
                }
                else if( isOptimal ){
                    rateOfWeightGainMessage += "optimal";
                }
                rateOfWeightGainMessage += ".";
            }
        }
        catch(error){
            rateOfWeightGainMessage = defaultRateString;
        }
    }
    else{
        rateOfWeightGainMessage = defaultRateString;
    }
    document.getElementById("rateOfWeightGain").innerHTML = rateOfWeightGainMessage;
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
