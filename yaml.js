const fs = require('fs');


const key_regex = /(^\w+)\x3A$/gm
const value_number_regex = /^[-+]?[0-9]*\.?[0-9]+$/gm
const value_text_regex = /^['"]?[\w\s*?]+['"]?$/gm


let depth_level_array = new Array();
let data_buffer = [];
let lexical_tokens = new Array();



function lexical_engine(){
    //generate tokens
    let depth_level = 0;
    let text_lock = false;
    
    let array_lock = false;
    let line_index = 0;
    let init_char_index = -1;
    data_buffer.forEach((obj, index)=>{

        if(obj == 45 && text_lock == false){depth_level_array.push(depth_level);array_lock=true;}
        if(obj == 32 && array_lock == false && text_lock == false){depth_level++;}
        if(obj == 58 && array_lock == false && text_lock == false){depth_level_array.push(depth_level) }
       
        if(obj == 34 ){
           
            init_char_index = index;
            text_lock = true;
        }
        if(obj == 10 && data_buffer[index-1] != 10){depth_level = 0; array_lock = false;line_index++;init_char_index = -1;}
       
        if(obj != 10 && obj != 32 && obj != 45 && init_char_index == -1 && text_lock == false){
            init_char_index = index;
        }
       
         if(obj == 34 ){
            
            symbol_type({token: data_buffer.slice(init_char_index, index+1).toString(), line_reference: line_index, isArrayHead: false})
            init_char_index = -1;

            text_lock = false;
        }
        if(obj == 58 && text_lock == false ){
            if(array_lock == false){
            symbol_type({token: data_buffer.slice(init_char_index, index+1).toString(), line_reference: line_index, isArrayHead: false})
            init_char_index = -1;
            }
            else{
                symbol_type({token: data_buffer.slice(init_char_index, index+1).toString(), line_reference: line_index, isArrayHead: true})
            init_char_index = -1;
            }
        }
        if(data_buffer[index + 1] == 10 && init_char_index != -1 && text_lock == false){
            if(array_lock == false){
                symbol_type({token: data_buffer.slice(init_char_index, index+1).toString(), line_reference: line_index, isArrayHead: false})
                init_char_index = -1;
                }
                else{
                symbol_type({token: data_buffer.slice(init_char_index, index+1).toString(), line_reference: line_index, isArrayHead: true})
                init_char_index = -1;
                }
        }
      

    })
}

function symbol_type(obj){
    if(obj.token.match(key_regex)?.length > 0){
        lexical_tokens.push({classifier: obj.token.split(":")[0], line_reference: obj.line_reference, token_type: "key", isArrayHead: obj.isArrayHead ? true : false})
    }
    else if(obj.token.match(value_number_regex)?.length > 0){
        lexical_tokens.push({classifier: obj.token, line_reference: obj.line_reference, token_type: "number",isArrayHead: obj.isArrayHead ? true : false})
    }
    else if(obj.token.match(value_text_regex)?.length > 0){
        lexical_tokens.push({classifier: obj.token, line_reference: obj.line_reference, token_type: "text",isArrayHead: obj.isArrayHead ? true : false})
    }

    
}

//driver
function yaml(_path){
    data_buffer = fs.readFileSync(_path); 
    lexical_engine();
    console.log(lexical_tokens)
    console.log(depth_level_array.length)
    
}

console.time("start");
yaml("./sample_data.yml");
console.timeEnd("start")

