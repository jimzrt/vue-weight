import { parseISO } from 'date-fns'

export function isoToDate(iso) {
        return parseISO(iso)
      }

      export function sortedIndex(array, value) {
    var low = 0,
        high = array.length;

    while (low < high) {
        var mid = (low + high) >>> 1;
        if (array[mid][0] < value) low = mid + 1;
        else high = mid;
    }
    return low;
}
  