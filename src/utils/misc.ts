function seq(count: number, startIndex = 0, reversed: number | boolean = false): number[] {
  const arr = [];
  if (reversed) {
    for (let i = 0; i < count; i++) {
      arr[i] = startIndex + count - 1 - i;
    }
  }else{
    for (let i = 0; i < count; i++) {
      arr[i] = startIndex + i;
    }
  }
  return arr;
}

function rseq(count: number, largestIndex?: number): number[] {
  if (typeof largestIndex !== 'number') {
    return seq(count, 0, true);
  }else{
    return seq(count, largestIndex-count+1, true);
  }
}


function waitMs(duration: number){
  return new Promise((resolve)=>{
    setTimeout(resolve, duration);
  });
}

export {
  seq,
  rseq,
  waitMs,
}