/**
 * @fileoverview EV3DEV Python Block Code Generator
 * @author markli97@gmail.com (Mark Li)
 */

'use strict';

goog.provide('Blockly.Python.ev3dev');

goog.require('Blockly.Python');

Blockly.Python['ev3_initialize_motors'] = function(block) {
	//get field values
  var dropdown_outa = block.getFieldValue('outA');
  var dropdown_outb = block.getFieldValue('outB');
  var dropdown_outc = block.getFieldValue('outC');
  var dropdown_outd = block.getFieldValue('outD');
  //append code as needed
  var code = '';
  if (dropdown_outa!='none'){code=code+'motorA='+dropdown_outa+'(\'outA\')\n';}
  if (dropdown_outb!='none'){code=code+'motorB='+dropdown_outb+'(\'outB\')\n';}
  if (dropdown_outc!='none'){code=code+'motorC='+dropdown_outc+'(\'outC\')\n';}
  if (dropdown_outd!='none'){code=code+'motorD='+dropdown_outd+'(\'outD\')\n';}
  return code;
};

Blockly.Python['ev3_motor'] = function(block) {
	//get field values
  var dropdown_type = Blockly.Python.valueToCode(block, 'func', Blockly.Python.ORDER_NONE);
  var dropdown_motor = Blockly.Python.valueToCode(block, 'motor', Blockly.Python.ORDER_NONE).replace(/'/g,'');
  var text_power = Blockly.Python.valueToCode(block, 'pow_', Blockly.Python.ORDER_NONE);
  var text_time = Blockly.Python.valueToCode(block, 'time_', Blockly.Python.ORDER_NONE);
  var text_deg = Blockly.Python.valueToCode(block, 'deg_', Blockly.Python.ORDER_NONE);
  var text_rot = Blockly.Python.valueToCode(block, 'rot_', Blockly.Python.ORDER_NONE);
  var checkbox_brake = Blockly.Python.valueToCode(block, 'brake_', Blockly.Python.ORDER_NONE) == 'FALSE';
  var checkbox_wait = Blockly.Python.valueToCode(block, 'wait_', Blockly.Python.ORDER_NONE) == 'FALSE';
  var code = '';
  //fix for negative power values
  //appends negative sign to rotations/degrees if power is negative but rotations/degrees is not
  if(parseInt(text_power)<0){
	  if(text_deg && text_deg.substring(0,1)!='-'){
		  text_deg='-'+text_deg;
	  }
	  if(text_rot && text_rot.substring(0,1)!='-'){
		  text_rot='-'+text_rot;
	  }
  }
  else{
	  if(text_deg && text_deg.substring(0,1)=='-'){
		  text_deg=text_deg.substring(1);
	  }
	  if(text_rot && text_rot.substring(0,1)=='-'){
		  text_rot=text_rot.substring(1);
	  }
  }
  //append stop command code.  'hold' brakes, 'coast' just turns off the motors
  //technically doesn't have to exist in all instances but block programming amirite
  if(checkbox_brake==false){
	  code='motor'+dropdown_motor+'.stop_command=\'hold\'\n'
  }
  else if (checkbox_brake==true && dropdown_type != 1){
	  code='motor'+dropdown_motor+'.stop_command=\'coast\'\n'
  }
  //actual motor control code
  switch(dropdown_type){
	  //stop
	  case '0':
		code=code + 'motor'+dropdown_motor+'.stop()\n';
		break;
		//run forever.  the while loop waits for it to complete which is stupid but there for completeness i guess
	  case '1':
		code=code + 'motor'+dropdown_motor+'.run_forever(duty_cycle_sp='+text_power+')\n';
		if(checkbox_wait==false){
			code=code+'while motor' + dropdown_motor + '.duty_cycle is not 0:\n  pass\n';
			code=code+'motor'+dropdown_motor+'.stop()\n';
		}
		break;
		//run timed.  since the cycle time is relatively slow, use the motors native time functions to get more accuracy
		//as far as i can tell the motors use their own interrupts, so its better to use them rather than poll
	  case '2':
	    code=code + 'motor'+dropdown_motor+'.time_sp='+text_time+'*1000\n';
		code=code + 'motor'+dropdown_motor+'.run_timed(duty_cycle_sp='+text_power+')\n';
		if(checkbox_wait==false){
			code=code+'time.sleep('+text_time+')\n';
			code=code+'motor'+dropdown_motor+'.stop()\n';
		}
		break;
		//run to degree.  same as time, use native functions for better control
	  case '3':
		code=code + 'motor'+dropdown_motor+'.position=0\nmotor'+dropdown_motor+'.position_sp=' + text_deg + '*motor' + dropdown_motor + '.count_per_rot/360.\nmotor'+dropdown_motor+'.run_to_abs_pos(duty_cycle_sp='+text_power+')\n'
		if(checkbox_wait==false){
			code=code+'while motor' + dropdown_motor + '.duty_cycle is not 0:\n  pass\n';
			code=code+'motor'+dropdown_motor+'.stop()\n';
		}
		break;
		//run to rotation.  
	  case '4':
	    code=code + 'motor'+dropdown_motor+'.position=0\nmotor'+dropdown_motor+'.position_sp=' + text_rot + '*motor' + dropdown_motor + '.count_per_rot\nmotor'+dropdown_motor+'.run_to_abs_pos(duty_cycle_sp='+text_power+')\n'
		if(checkbox_wait==false){
			code=code+'while motor' + dropdown_motor + '.duty_cycle is not 0:\n  pass\n';
			code=code+'motor'+dropdown_motor+'.stop()\n';
		}
		break;
		//in case something breaks the default is just to stop the motors
	  default:
	    code=code + 'motor'+dropdown_motor+'.stop()\n';
		break;
  }
  return code;
};

Blockly.Python['ev3_drive'] = function(block) {
	//get field values
  var dropdown_type = Blockly.Python.valueToCode(block, 'func', Blockly.Python.ORDER_NONE);
  var dropdown_motor = Blockly.Python.valueToCode(block, 'motors', Blockly.Python.ORDER_NONE).replace(/ /g, '').replace('[','').replace(']','').split(',');
  var dropdown_leftmotor = dropdown_motor[0].replace(/'/g, '');
  var dropdown_rightmotor = dropdown_motor[1].replace(/'/g, '');
  var text_lpower = Blockly.Python.valueToCode(block, 'lpow', Blockly.Python.ORDER_NONE);
  var text_rpower = Blockly.Python.valueToCode(block, 'rpow', Blockly.Python.ORDER_NONE);
  var text_time = Blockly.Python.valueToCode(block, 'time_', Blockly.Python.ORDER_NONE);
  var text_rdeg = Blockly.Python.valueToCode(block, 'deg_', Blockly.Python.ORDER_NONE);
  var text_ldeg = text_rdeg;
  var text_rrot = Blockly.Python.valueToCode(block, 'rot_', Blockly.Python.ORDER_NONE);
  var text_lrot = text_rrot;
  var checkbox_brake = Blockly.Python.valueToCode(block, 'brake_', Blockly.Python.ORDER_NONE) == 'FALSE';
  var checkbox_wait = Blockly.Python.valueToCode(block, 'wait_', Blockly.Python.ORDER_NONE) == 'FALSE';
  var code = '';
  //fix negative power values
  //appends negative sign to rotations/degrees if power is negative but rotations/degrees is not
  if(parseInt(text_lpower)<0){
	  if(text_ldeg && text_ldeg.substring(0,1)!='-'){
		  text_ldeg='-'+text_ldeg;
	  }
	  if(text_lrot && text_lrot.substring(0,1)!='-'){
		  text_lrot='-'+text_lrot;
	  }
  }
  else{
	  if(text_ldeg && text_ldeg.substring(0,1)=='-'){
		  text_ldeg=text_ldeg.substring(1);
	  }
	  if(text_lrot && text_lrot.substring(0,1)=='-'){
		  text_lrot=text_lrot.substring(1);
	  }
  }
  if(parseInt(text_rpower)<0){
	  if(text_rdeg && text_rdeg.substring(0,1)!='-'){
		  text_rdeg='-'+text_rdeg;
	  }
	  if(text_rrot && text_rrot.substring(0,1)!='-'){
		  text_rrot='-'+text_rrot;
	  }
  }
  else{
	  if(text_rdeg && text_rdeg.substring(0,1)=='-'){
		  text_rdeg=text_rdeg.substring(1);
	  }
	  if(text_rrot && text_rrot.substring(0,1)=='-'){
		  text_rrot=text_rrot.substring(1);
	  }
  }
  //append stop command code.  'hold' brakes, 'coast' just turns off the motors
  //technically doesn't have to exist in all instances but block programming amirite
  if(checkbox_brake==false){
	  code='motor'+dropdown_leftmotor+'.stop_command=\'hold\'\n'
	  code=code+'motor'+dropdown_rightmotor+'.stop_command=\'hold\'\n'
  }
  else if (checkbox_brake==true && dropdown_type != 1){
	  code='motor'+dropdown_leftmotor+'.stop_command=\'coast\'\n'
	  code=code+'motor'+dropdown_rightmotor+'.stop_command=\'coast\'\n'
  }
  //actual motor control code
  switch(dropdown_type){
	  case '0':
		code=code + 'motor'+dropdown_leftmotor+'.stop()\n';
		code=code + 'motor'+dropdown_rightmotor+'.stop()\n';
		break;
		//run forever.  the while loop waits for it to complete which is stupid but there for completeness i guess
	  case '1':
		code=code + 'motor'+dropdown_leftmotor+'.run_forever(duty_cycle_sp='+text_lpower+')\n';
		code=code + 'motor'+dropdown_rightmotor+'.run_forever(duty_cycle_sp='+text_rpower+')\n';
		if(checkbox_wait==false){
			code=code+'while ';
			if(text_lpower!='0'){
				code=code+'(motor' + dropdown_leftmotor + '.duty_cycle is not 0)';
				if(text_rpower!='0'){
					code=code+' or (motor' + dropdown_rightmotor + '.duty_cycle is not 0)';
				}
			}
			else if(text_rpower!='0'){
				code=code+'(motor' + dropdown_rightmotor + '.duty_cycle is not 0)';
			}
			else{
				code=code+'(motor' + dropdown_leftmotor + '.duty_cycle is not 0) and (motor' + dropdown_rightmotor + '.duty_cycle is not 0)';
			}
			code=code+':\n  pass\n';
			code=code+'motor'+dropdown_leftmotor+'.stop()\nmotor'+dropdown_rightmotor+'.stop()\n';
		}
		break;
		//run timed.  since the cycle time is relatively slow, use the motors native time functions to get more accuracy
		//as far as i can tell the motors use their own interrupts, so its better to use them rather than poll
	  case '2':
	    code=code + 'motor'+dropdown_leftmotor+'.time_sp='+text_time+'*1000\n';
		code=code + 'motor'+dropdown_rightmotor+'.time_sp='+text_time+'*1000\n';
		code=code + 'motor'+dropdown_leftmotor+'.run_timed(duty_cycle_sp='+text_lpower+')\n';
		code=code + 'motor'+dropdown_rightmotor+'.run_timed(duty_cycle_sp='+text_rpower+')\n';
		if(checkbox_wait==false){
			code=code + 'time.sleep('+text_time+')\n';
			code=code+'motor'+dropdown_leftmotor+'.stop()\nmotor'+dropdown_rightmotor+'.stop()\n';
		}
		break;
		//run to degree.  same as time, use native functions for better control
	  case '3':
		code=code + 'motor'+dropdown_leftmotor+'.position=0\n'
		code=code + 'motor'+dropdown_rightmotor+'.position=0\n'
		code=code + 'motor'+dropdown_leftmotor+'.position_sp=' + text_ldeg + '*motor' + dropdown_leftmotor + '.count_per_rot/360.\n'
		code=code + 'motor'+dropdown_rightmotor+'.position_sp=' + text_rdeg + '*motor' + dropdown_rightmotor + '.count_per_rot/360.\n'
		code=code + 'motor'+dropdown_leftmotor+'.run_to_abs_pos(duty_cycle_sp='+text_lpower+')\n'
		code=code + 'motor'+dropdown_rightmotor+'.run_to_abs_pos(duty_cycle_sp='+text_rpower+')\n'
		if(checkbox_wait==false){
			code=code+'while ';
			if(text_lpower!='0'){
				code=code+'(motor' + dropdown_leftmotor + '.duty_cycle is not 0)';
				if(text_rpower!='0'){
					code=code+' or (motor' + dropdown_rightmotor + '.duty_cycle is not 0)';
				}
			}
			else if(text_rpower!='0'){
				code=code+'(motor' + dropdown_rightmotor + '.duty_cycle is not 0)';
			}
			else{
				code=code+'(motor' + dropdown_leftmotor + '.duty_cycle is not 0) and (motor' + dropdown_rightmotor + '.duty_cycle is not 0)';
			}
			code=code+':\n  pass\n';
			code=code+'motor'+dropdown_leftmotor+'.stop()\nmotor'+dropdown_rightmotor+'.stop()\n';
		}
		break;
		//run to rotation. 
	  case '4':
	    code=code + 'motor'+dropdown_leftmotor+'.position=0\n'
		code=code + 'motor'+dropdown_rightmotor+'.position=0\n'
		code=code + 'motor'+dropdown_leftmotor+'.position_sp=' + text_lrot + '*motor' + dropdown_leftmotor + '.count_per_rot\n'
		code=code + 'motor'+dropdown_rightmotor+'.position_sp=' + text_rrot + '*motor' + dropdown_rightmotor + '.count_per_rot\n'
		code=code + 'motor'+dropdown_leftmotor+'.run_to_abs_pos(duty_cycle_sp='+text_lpower+')\n'
		code=code + 'motor'+dropdown_rightmotor+'.run_to_abs_pos(duty_cycle_sp='+text_rpower+')\n'
		if(checkbox_wait==false){
			code=code+'while ';
			if(text_lpower!='0'){
				code=code+'(motor' + dropdown_leftmotor + '.duty_cycle is not 0)';
				if(text_rpower!='0'){
					code=code+' or (motor' + dropdown_rightmotor + '.duty_cycle is not 0)';
				}
			}
			else if(text_rpower!='0'){
				code=code+'(motor' + dropdown_rightmotor + '.duty_cycle is not 0)';
			}
			else{
				code=code+'(motor' + dropdown_leftmotor + '.duty_cycle is not 0) and (motor' + dropdown_rightmotor + '.duty_cycle is not 0)';
			}
			code=code+':\n  pass\n';
			code=code+'motor'+dropdown_leftmotor+'.stop()\nmotor'+dropdown_rightmotor+'.stop()\n';
		}
		break;
		//in case something breaks the default is just to stop the motors
	  default:
	    code=code + 'motor'+dropdown_leftmotor+'.stop()\n';
		code=code + 'motor'+dropdown_rightmotor+'.stop()\n';
		break;
  }
  return code;
};

Blockly.Python['ev3_display'] = function(block) {
	//get field values
  var dropdown_function = Blockly.Python.valueToCode(block, 'func', Blockly.Python.ORDER_NONE);
  var text_c1 = Blockly.Python.valueToCode(block, 'coord', Blockly.Python.ORDER_NONE).replace(/ /g, '').replace('[','').replace(']','').split(',');
  var text_xc1 = text_c1[0];
  var text_yc1 = text_c1[1];
  var text_c2 = Blockly.Python.valueToCode(block, 'coord2', Blockly.Python.ORDER_NONE).replace(/ /g, '').replace('[','').replace(']','').split(',');
  var text_xc2 = text_c2[0];
  var text_yc2 = text_c2[1];
  var checkbox_name = Blockly.Python.valueToCode(block, 'cls', Blockly.Python.ORDER_NONE).toUpperCase() == 'TRUE';
  var code = '';
  //append a clear function if needed
  if(checkbox_name){code='lcd.clear()\n';}
  //switch based on dropdown for actual draw functions
  switch(dropdown_function){
	  //draw text
	  case '0':
		var text_text = Blockly.Python.valueToCode(block, 'txt', Blockly.Python.ORDER_NONE);
		code=code+'lcd.draw.text(('+text_xc1+', '+text_yc1+'),'+text_text+')\n';
		break;
		//draw line between two points
	  case '1':
	    code=code+'lcd.draw.line([('+text_xc1+', '+text_yc1+'), ('+text_xc2+', '+text_yc2+')])\n';
		break;
		//draw arc.  choose type of arc based on dropdown
	  case '2':
	    var options = Blockly.Python.valueToCode(block, 'arctype', Blockly.Python.ORDER_NONE);
		switch(options){
			case '0':
			  code=code+'lcd.draw.arc([(';
			  break;
			case '1':
			  code=code+'lcd.draw.pieslice([(';
			  break;
			case '2':
			  code=code+'lcd.draw.chord([(';
			  break;
		}
		//get start/end values
		var start = Blockly.Python.valueToCode(block, 'angle', Blockly.Python.ORDER_NONE);
		var end = Blockly.Python.valueToCode(block, 'angle2', Blockly.Python.ORDER_NONE);
		code=code+text_xc1+', '+text_yc1+'), ('+text_xc2+', '+text_yc2+')], '+start+', '+end;
		//check for fill requirements
		var fill=Blockly.Python.valueToCode(block, 'fill', Blockly.Python.ORDER_NONE);
		if(fill=='TRUE'){
			//the fill parameter takes in a color.  in this case, it is black because the ev3 screen is monochrome
			code=code+', fill=0)\n';
		}
		else{
			code=code+')\n';
		}
		break;
		//draw rectangle between two corners
	  case '3':
		code=code+'lcd.draw.rectangle([('+text_xc1+', '+text_yc1+'), ('+text_xc2+', '+text_yc2+')]';
		var fill=Blockly.Python.valueToCode(block, 'fill', Blockly.Python.ORDER_NONE);
		if(fill=='TRUE'){
			//the fill parameter takes in a color.  in this case, it is black because the ev3 screen is monochrome
			code=code+', fill=0)\n';
		}
		else{
			code=code+')\n';
		}
		break;
		//draw a point
	  case '4':
		code=code+'lcd.draw.point(('+text_xc1+', '+text_yc1+'))\n';
		break;
  }
  //update the lcd.  nothing will appear if this is not called
  code=code+'lcd.update()\n';
  return code;
};
//initialize the display for later use
Blockly.Python['ev3_initializedisplay'] = function(block) {
  var checkbox_y = block.getFieldValue('y') == 'TRUE';
  var code = '';
  //instantiate the lcd object
  if(checkbox_y){code='lcd=Screen()\n';}
  return code;
};
//initialize the buttons for later use
Blockly.Python['ev3_initializebuttons'] = function(block) {
  var checkbox_y = block.getFieldValue('y') == 'TRUE';
  var code = '';
  //instantiate button object
  if(checkbox_y){code='button=Button()\n';}
  return code;
};
//change the LED color
//the ev3 leds are a combination of red and green leds, so it can only do green red yellow and i think orange
Blockly.Python['ev3_leds'] = function(block) {
  var dropdown_side = Blockly.Python.valueToCode(block, 'side', Blockly.Python.ORDER_NONE);
  var dropdown_color = Blockly.Python.valueToCode(block, 'color', Blockly.Python.ORDER_NONE);
  var color;
  if(dropdown_color==0){color='Leds.GREEN';}
  else if(dropdown_color==1){color='Leds.YELLOW';}
  else{color='Leds.RED';}
  var code='';
  if(dropdown_side=='Leds.LEFT'){
	code = 'Leds.set_color(' + 'Leds.LEFT' + ',' + color + ')\n'
  }else if(dropdown_side=='Leds.RIGHT'){
	code = 'Leds.set_color(' + 'Leds.RIGHT' + ',' + color + ')\n';
  }else if(dropdown_side=='ERROR'){
	code = 'Leds.set_color(' + 'Leds.LEFT' + ',' + color + ')\nLeds.set_color(' + 'Leds.RIGHT' + ',' + color + ')\n';
  }else{
	code = '';
  }
  return code;
};
//plays a tone
Blockly.Python['ev3_sound'] = function(block) {
  var text_hz = Blockly.Python.valueToCode(block, 'hz', Blockly.Python.ORDER_NONE);
  var text_sec = Blockly.Python.valueToCode(block, 'sec', Blockly.Python.ORDER_NONE)*1000;
  var dropdown_type = Blockly.Python.valueToCode(block, 'type', Blockly.Python.ORDER_NONE);
  var code = 'Sound.tone('+text_hz+', '+text_sec+')';
  //if a wait is needed, append it
  if(dropdown_type=='0'){code=code+'.wait()';}
  code=code+'\n';
  return code;
};

Blockly.Python['ev3_buttons'] = function(block) {
  var dropdown_type = Blockly.Python.valueToCode(block, 'type', Blockly.Python.ORDER_NONE);
  var checkbox = Blockly.Python.valueToCode(block, 'check', Blockly.Python.ORDER_NONE).replace(/ /g, '').replace('[','').replace(']','').split(',');
  var checkbox_up = false;
  var checkbox_dn = false;
  var checkbox_lf = false;
  var checkbox_ri = false;
  var checkbox_en = false;
  var checkbox_ba = false;
  //check array for all values
  for (var check in checkbox){
	  switch(checkbox[check]){
		  case '1':
			checkbox_lf=true;
			break;
		  case '2':
		    checkbox_en=true;
			break;
		  case '3':
		    checkbox_ri=true;
			break;
		  case '4':
		    checkbox_up=true;
			break;
		  case '5':
		    checkbox_dn=true;
			break;
		  case '6':
		    checkbox_ba=true;
			break;
	  }
  }
  var code='(';
  //conditional to choose pressed or released
  if(dropdown_type=='1'){
	  if(checkbox_up){code=code+'button.up';}
	  //code formatting stuff
	  if(checkbox_dn){if(code!='('){code=code+' and button.down';}else{code=code+'button.down';}}
	  if(checkbox_lf){if(code!='('){code=code+' and button.left';}else{code=code+'button.left';}}
	  if(checkbox_ri){if(code!='('){code=code+' and button.right';}else{code=code+'button.right';}}
	  if(checkbox_en){if(code!='('){code=code+' and button.enter';}else{code=code+'button.enter';}}
	  if(checkbox_ba){if(code!='('){code=code+' and button.backspace';}else{code=code+'button.backspace';}}
	  code=code+')';
  }
  else if(dropdown_type=='2'){
	  code='(';
	  if(checkbox_up){code=code+'button.up';}
	  if(checkbox_dn){if(code!='('){code=code+' or button.down';}else{code=code+'button.down';}}
	  if(checkbox_lf){if(code!='('){code=code+' or button.left';}else{code=code+'button.left';}}
	  if(checkbox_ri){if(code!='('){code=code+' or button.right';}else{code=code+'button.right';}}
	  if(checkbox_en){if(code!='('){code=code+' or button.enter';}else{code=code+'button.enter';}}
	  if(checkbox_ba){if(code!='('){code=code+' or button.backspace';}else{code=code+'button.backspace';}}
	  code=code+')';
  }
  else if(dropdown_type=='3'){
	  code='not (';
	  if(checkbox_up){code=code+'button.up';}
	  if(checkbox_dn){if(code!='not ('){code=code+' or button.down';}else{code=code+'button.down';}}
	  if(checkbox_lf){if(code!='not ('){code=code+' or button.left';}else{code=code+'button.left';}}
	  if(checkbox_ri){if(code!='not ('){code=code+' or button.right';}else{code=code+'button.right';}}
	  if(checkbox_en){if(code!='not ('){code=code+' or button.enter';}else{code=code+'button.enter';}}
	  if(checkbox_ba){if(code!='not ('){code=code+' or button.backspace';}else{code=code+'button.backspace';}}
	  code=code+')';
  }
  else if(dropdown_type=='4'){
	  code='not (';
	  if(checkbox_up){code=code+'button.up';}
	  if(checkbox_dn){if(code!='not ('){code=code+' and button.down';}else{code=code+'button.down';}}
	  if(checkbox_lf){if(code!='not ('){code=code+' and button.left';}else{code=code+'button.left';}}
	  if(checkbox_ri){if(code!='not ('){code=code+' and button.right';}else{code=code+'button.right';}}
	  if(checkbox_en){if(code!='not ('){code=code+' and button.enter';}else{code=code+'button.enter';}}
	  if(checkbox_ba){if(code!='not ('){code=code+' and button.backspace';}else{code=code+'button.backspace';}}
	  code=code+')';
  }
  checkbox_up = !checkbox_up;
  checkbox_dn = !checkbox_dn;
  checkbox_lf = !checkbox_lf;
  checkbox_ri = !checkbox_ri;
  checkbox_en = !checkbox_en;
  checkbox_ba = !checkbox_ba;
  //special case if no checkboxes are checked
  if(checkbox_up && checkbox_dn && checkbox_lf && checkbox_ri && checkbox_en && checkbox_ba){
	  if(dropdown_type=="1"){
		  code='not (button.up or button.down or button.left or button.right or button.enter or button.backspace)';
	  }
	  else{
		  code='(button.up and button.down and button.left and button.right and button.enter and button.backspace)';
	  }
  }
  
  return [code, Blockly.Python.ORDER_NONE];
};

//initialize sensors
Blockly.Python['ev3_initializeinputs'] = function(block) {
  var dropdown_in1 = block.getFieldValue('in1');
  var dropdown_in2 = block.getFieldValue('in2');
  var dropdown_in3 = block.getFieldValue('in3');
  var dropdown_in4 = block.getFieldValue('in4');
  var code = '';
  //append code as required
  if (dropdown_in1!='none'){code=code+'input1='+dropdown_in1+'(\'in1\')\n';}
  if (dropdown_in2!='none'){code=code+'input2='+dropdown_in2+'(\'in2\')\n';}
  if (dropdown_in3!='none'){code=code+'input3='+dropdown_in3+'(\'in3\')\n';}
  if (dropdown_in4!='none'){code=code+'input4='+dropdown_in4+'(\'in4\')\n';}
  return code;	
};
//get value of sensor
Blockly.Python['ev3_sensors'] = function(block) {
  var dropdown_in = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE);
  //pretty much just get the value in python
  var code='input'+dropdown_in+'.value()';
  return [code, Blockly.Python.ORDER_NONE];
};
Blockly.Python['ev3_adjustedgyro'] = function(block) {
  var dropdown_port = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE);
  //pretty much just get the value in python
  Blockly.Python.definitions_['gyroOffset'+dropdown_port] = 'gyroOffset'+dropdown_port+' = 0';
  var code='input'+dropdown_port+'.value() - gyroOffset'+dropdown_port;
  return [code, Blockly.Python.ORDER_NONE];
};
//wait for value of sensor
Blockly.Python['ev3_sensors2'] = function(block) {
  var dropdown_in = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE);
  var dropdown_value = Blockly.Python.valueToCode(block, 'wait', Blockly.Python.ORDER_NONE);
  var lge=block.getFieldValue('lge');
  var type=block.getFieldValue('type1');
  var code='';
  //conditional to determine which sensor type we're dealing with
  if(type=='g'){
	  Blockly.Python.definitions_['gyroOffset'+dropdown_in] = 'gyroOffset'+dropdown_in+' = 0';
	  //less than greater than or equal to conditional
	  if(lge=='gt'){
		  code='while input'+dropdown_in+'.value() - gyroOffset'+dropdown_in+' <= '+dropdown_value+':\n  pass\n';
	  }
	  else if(lge=='lt'){
		  code='while input'+dropdown_in+'.value() - gyroOffset'+dropdown_in+' >= '+dropdown_value+':\n  pass\n';
	  }
	  else{
		  code='while input'+dropdown_in+'.value() - gyroOffset'+dropdown_in+' != '+dropdown_value+':\n  pass\n';
	  }
  }
  else if(type=='u'){
	  //less than greater than or equal to conditional
	  if(lge=='gt'){
		  code='while input'+dropdown_in+'.value() <= '+dropdown_value+':\n  pass\n';
	  }
	  else if(lge=='lt'){
		  code='while input'+dropdown_in+'.value() >= '+dropdown_value+':\n  pass\n';
	  }
	  else{
		  code='while input'+dropdown_in+'.value() != '+dropdown_value+':\n  pass\n';
	  }
  }
  else{
	  code='while input'+dropdown_in+'.value() != '+dropdown_value+':\n  pass\n';
  }
  return code;
};
//return value of motor encoder
Blockly.Python['ev3_motorencoder'] = function(block) {
  var dropdown_in = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE);
  var code='motor'+dropdown_in+'.position';
  return [code, Blockly.Python.ORDER_NONE];
};
//wait until motor encoder value is seen
Blockly.Python['ev3_motorencoder2'] = function(block) {
  var dropdown_in = Blockly.Python.valueToCode(block, 'wait', Blockly.Python.ORDER_NONE);
  var dropdown_value = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE);
  var lge=block.getFieldValue('lge');
  var type=block.getFieldValue('type1');
  var code='';
  //less than greater than or equal to conditional
	if(lge=='gt'){
	  code='while motor'+dropdown_in+'.position <= '+dropdown_value+':\n  pass\n';
	}
	else if(lge=='lt'){
	  code='while motor'+dropdown_in+'.position >= '+dropdown_value+':\n  pass\n';
	}
	else{
	  code='while motor'+dropdown_in+'.position != '+dropdown_value+':\n  pass\n';
	}
  return code;
};
//set motor encoder position
Blockly.Python['ev3_motorencoderset'] = function(block) {
  var dropdown_in = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE);
  var dropdown_value = Blockly.Python.valueToCode(block, 'wait', Blockly.Python.ORDER_NONE);
  var code='motor'+dropdown_in+'.position = '+dropdown_value+'\n';
  return code;
};
//set gyro position
Blockly.Python['ev3_gyroset'] = function(block) {
  var dropdown_port = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE);
  var dropdown_value = Blockly.Python.valueToCode(block, 'wait', Blockly.Python.ORDER_NONE);
  Blockly.Python.definitions_['gyroOffset'+dropdown_port] = 'gyroOffset'+dropdown_port+' = 0';
  var code='gyroOffset'+dropdown_port+' = input'+dropdown_port+'.value()'
  if(dropdown_value!='0'){
	  code=code + ' - ' + dropdown_value;
  }
  code=code+'\n';
  return code;
};
//call time.sleep
Blockly.Python['ev3_timeout'] = function(block) {
  var dropdown_in = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE);
  var code='time.sleep('+dropdown_in+')\n';
  return code;
};
//set sensor function then sleep momentarily to make sure the new mode is accounted for
Blockly.Python['ev3_setsensor'] = function(block) {
  var dropdown_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_NONE);
  var dropdown_func = Blockly.Python.valueToCode(block, 'drop', Blockly.Python.ORDER_NONE);
  var code='input'+dropdown_port+'.mode = \''+dropdown_func+'\'\ntime.sleep(0.05)\n';
  return code;
};



















// Computer program
Blockly.Python['blue-color'] = function(block) {
  var code='';
  code = 'Sound.tone(440, 1000).wait()\n';
  return code;
};

Blockly.Python['green-color'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';

  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=1*1000\nmotorB.time_sp=1*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0 + code1 + code2 + code3;
  return code;
};

Blockly.Python['red-color'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=1*1000\nmotorB.time_sp=1*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=-75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};

Blockly.Python['orange-color'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=2*1000\nmotorB.time_sp=2*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=0)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};

Blockly.Python['purple-color'] = function(block) {
  var code='';
  code = 'Sound.speak(\'Good job\')\n';
  return code;
};







// Logic programming 1
Blockly.Python['blue-lp1'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=2*1000\nmotorB.time_sp=2*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=0)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};

Blockly.Python['red-lp1'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';

  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=1*1000\nmotorB.time_sp=1*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0 + code1 + code2 + code3;
  return code;
};

Blockly.Python['orange-lp1'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=1*1000\nmotorB.time_sp=1*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=-75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};

Blockly.Python['purple-lp1'] = function(block) {
  var code='';
  code = 'Sound.tone(440, 1000).wait()\n';
  return code;
};

Blockly.Python['green-lp1'] = function(block) {
  var code='';
  code = 'Sound.speak(\'Good job\')\n';
  return code;
};


Blockly.Python['grey-color'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=1*1000\nmotorB.time_sp=1*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=-75)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};




// Flowchart
Blockly.Python['blue-fc'] = function(block) {
  var code='';
  code = 'Sound.speak(\'Good job\')\n';
  return code;
};

Blockly.Python['red-fc'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';

  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=1*1000\nmotorB.time_sp=1*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0 + code1 + code2 + code3;
  return code;
};

Blockly.Python['orange-fc'] = function(block) {	
  var code='';
  code = 'Sound.tone(440, 1000).wait()\n';
  return code;
};


Blockly.Python['purple-fc'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=2*1000\nmotorB.time_sp=2*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=0)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};

Blockly.Python['green-fc'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=1*1000\nmotorB.time_sp=1*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=-75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};








Blockly.Python['blue-block'] = function(block) {
  var code='';
  var code1='';
  var code2='';
  var code3='';

  code1 = 'motorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\nmotorA.time_sp=1*1000\n';
  code2 = 'motorB.time_sp=1*1000\nmotorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code1 + code2 + code3;
  return code;
};

Blockly.Python['red-block'] = function(block) {
  var code='';
  var code1='';
  var code2='';
  var code3='';
  
  code1 = 'motorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\nmotorA.time_sp=1*1000\n';
  code2 = 'motorB.time_sp=1*1000\nmotorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=0)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code1 + code2 + code3;
  return code;
};

Blockly.Python['yellow-block'] = function(block) {
  var text_name = block.getFieldValue('speak');
  var code='';
  code = 'Sound.speak(\'Good job!\')\n';
  return code;
};

Blockly.Python['grey-block'] = function(block) {
  var code='';
  code = 'Sound.tone(440, 1000).wait()\n';
  return code;
};

Blockly.Python['green-block'] = function(block) {
  var code='';
  var code1='';
  var code2='';
  var code3='';
  
  code1 = 'motorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\nmotorA.time_sp=1*1000\n';
  code2 = 'motorB.time_sp=1*1000\nmotorA.run_timed(duty_cycle_sp=0)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code1 + code2 + code3;
  return code;
};



// Logical Programming 2
/*Blockly.Python['setup-flow-chart'] = function(block) {
  var code='';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')';
  return code;
};
*/





Blockly.Python['speak_loud'] = function(block) {
  var text_name = block.getFieldValue('speak');
  var code='';
  code = 'Sound.speak(\'' + text_name + '\')\n';
  return code;
};

Blockly.Python['blue-lp2'] = function(block) {
  var code='';
  code = 'Sound.tone(440, 1000).wait()\n';
  return code;
};

Blockly.Python['green-lp2'] = function(block) {
  var number_time = block.getFieldValue('time');
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';

  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp='+number_time+'*1000\nmotorB.time_sp='+number_time+'*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep('+number_time+')\nmotorA.stop()\nmotorB.stop()\n';

  code = code0 + code1 + code2 + code3;
  return code;
};

Blockly.Python['red-lp2'] = function(block) {
  var number_time = block.getFieldValue('time');
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp='+number_time+'*1000\nmotorB.time_sp='+number_time+'*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=-75)\n';
  code3 = 'time.sleep('+number_time+')\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};

Blockly.Python['orange-lp2'] = function(block) {
  var number_time = block.getFieldValue('time');
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp='+number_time+'*1000\nmotorB.time_sp='+number_time+'*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=0)\n';
  code3 = 'time.sleep('+number_time+')\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};

Blockly.Python['purple-lp2'] = function(block) {
  var code='';
  code = 'Sound.speak(\'Good job\')\n';
  return code;
};

Blockly.Python['grey-lp2'] = function(block) {
  var number_time = block.getFieldValue('time');
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp='+number_time+'*1000\nmotorB.time_sp='+number_time+'*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=-75)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep('+number_time+')\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};



// Repetition
Blockly.Python['repetitionbothwheelsforward'] = function(block) {
  var number_time = block.getFieldValue('time');
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';

  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp='+number_time+'*1000\nmotorB.time_sp='+number_time+'*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep('+number_time+')\nmotorA.stop()\nmotorB.stop()\n';

  code = code0 + code1 + code2 + code3;
  return code;
};

Blockly.Python['repetitionbothwheelsbackward'] = function(block) {
  var number_time = block.getFieldValue('time');
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp='+number_time+'*1000\nmotorB.time_sp='+number_time+'*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=-75)\nmotorB.run_timed(duty_cycle_sp=-75)\n';
  code3 = 'time.sleep('+number_time+')\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};

Blockly.Python['repetitionbothwheelsleft'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=1*1000\nmotorB.time_sp=1*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=0)\nmotorB.run_timed(duty_cycle_sp=75)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};

Blockly.Python['repetitionbothwheelsright'] = function(block) {
  var code='';
  var code0='';
  var code1='';
  var code2='';
  var code3='';
  
  code0 = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorA.stop_command=\'hold\'\nmotorB.stop_command=\'hold\'\n';
  code1 = 'motorA.time_sp=1*1000\nmotorB.time_sp=1*1000\n';
  code2 = 'motorA.run_timed(duty_cycle_sp=75)\nmotorB.run_timed(duty_cycle_sp=0)\n';
  code3 = 'time.sleep(1)\nmotorA.stop()\nmotorB.stop()\n';

  code = code0+code1+code2+code3;

  return code;
};






// Programming Loop
Blockly.Python['rep'] = function(block) {
  var text_rep1 = block.getFieldValue('rep1');
  var statements_statement1 = Blockly.Python.statementToCode(block, 'statement1');
  var text_rep2 = block.getFieldValue('rep2');
  var statements_statement2 = Blockly.Python.statementToCode(block, 'statement2');
  var text_rep3 = block.getFieldValue('rep3');
  var statements_statement3 = Blockly.Python.statementToCode(block, 'statement3');
  var text_rep4 = block.getFieldValue('rep4');
  var statements_statement4 = Blockly.Python.statementToCode(block, 'statement4');
  var text_rep5 = block.getFieldValue('rep5');
  var statements_statement5 = Blockly.Python.statementToCode(block, 'statement5');

  var code  = '';
  var code0 = '';
  var code1 = '';
  var code2 = '';
  var code3 = '';
  var code4 = '';
  var code5 = '';
  var code6 = '';
  var code7 = '';
  var code8 = '';
  var code9 = '';

  code0 = 'for count in range('+text_rep1+'):\n';
  if(statements_statement1==''){statements_statement1='  pass\n';}
  code1= statements_statement1;	
  code2 = 'for count2 in range('+text_rep2+'):\n';
  if(statements_statement2==''){statements_statement2='  pass\n';}
  code3 = statements_statement2;
  code4 = 'for count3 in range('+text_rep3+'):\n';
  if(statements_statement3==''){statements_statement3='  pass\n';}
  code5 = statements_statement3;
  code6 = 'for count4 in range('+text_rep4+'):\n';
  if(statements_statement4==''){statements_statement4='  pass\n';}
  code7 = statements_statement4;
  code8 = 'for count5 in range('+text_rep5+'):\n';
  if(statements_statement5==''){statements_statement5='  pass\n';}
  code9 = statements_statement5;

  code = code0+code1+code2+code3+code4+code5+code6+code7+code8+code9;

  return code;
};

// Infinite Loop
Blockly.Python['numb'] = function(block) {
  var text_name = block.getFieldValue('times');
  var code='';
  code = text_name;
  return code;
};

Blockly.Python['clockwise'] = function(block) {
  var code='';
  code = '+';
  return code;
};

Blockly.Python['counterclockwise'] = function(block) {
  var code='';
  code = '-';
  return code;
};

Blockly.Python['foreverin'] = function(block) {
  var code='';
  var order;
  code = 'float("inf")';
  order = Blockly.Python.ORDER_FUNCTION_CALL;
  return [code, order];
};

// Conditional Statements
Blockly.Python['if-block'] = function(block) {
  var value_colorblock = Blockly.Python.valueToCode(block, 'colorblock', Blockly.Python.ORDER_ATOMIC);
  var statements_condition = Blockly.Python.statementToCode(block, 'condition');
  var code = '';
  
  if(value_colorblock!=''){
  code = 'if input1.value()=='+value_colorblock+'\n'+statements_condition;}

  return code;
};

Blockly.Python['yellow-input'] = function(block) {
  var code='';
 
  code = '4';
  return code;
};

Blockly.Python['red-input'] = function(block) {
var code='';
 
  code = '5';
  return code;
};

Blockly.Python['green-input'] = function(block) {
var code='';
 
  code = '3';
  return code;
};

Blockly.Python['white-input'] = function(block) {
var code='';
 
  code = '6';
  return code;
};

Blockly.Python['black-input'] = function(block) {
var code='';
 
  code = '1';
  return code;
};

Blockly.Python['blue-input'] = function(block) {
var code='';
 
  code = '2';
  return code;
};



// SETUPS
Blockly.Python['setup-computer-program'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\n';
  return code;
};
Blockly.Python['setup-logical-program1'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-flow-chart'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-logical-program2'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-repetition'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-programming-Loop'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-forever'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-function'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-comparison'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-conditional'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-break'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-memory'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-idle'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-input'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-artificial'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-color'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-sorting'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};
Blockly.Python['setup-time'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorA = LargeMotor(\'outA\')\nmotorB = LargeMotor(\'outB\')\nmotorC = MediumMotor(\'outC\')\nmotorD = MediumMotor(\'outD\')\ninput1=TouchSensor(\'in1\')\ninput2=ColorSensor(\'in2\')\ninput3=UltrasonicSensor(\'in3\')\ninput4=GyroSensor(\'in4\')\n';
  return code;
};








Blockly.Python['if_block'] = function(block) {
  var value_colorblock = Blockly.Python.valueToCode(block, 'colorblock', Blockly.Python.ORDER_ATOMIC);
  var statements_condition = Blockly.Python.statementToCode(block, 'condition');
  // TODO: Assemble Python into code variable.
  var code = '';

  if(value_colorblock==''){code='sdfghhgfdsa';}
  else if(value_colorblock==1){code='if input2==1\n';}
  else if(value_colorblock==2){code='if input2==2\n';}
  else if(value_colorblock==3){code='if input2==3\n';}
  else if(value_colorblock==4){code='if input2==4\n';}
  else if(value_colorblock==5){code='if input2==5\n';}
  else if(value_colorblock==6){code='if input2==6\n';}

  return code;
};


Blockly.Python['closeleft'] = function(block) {
  var code='';
  code = 'motorC.stop_command=\'hold\'\nmotorC.position=0\nmotorC.position_sp=0.25*motorC.count_per_rot\nmotorC.run_to_abs_pos(duty_cycle_sp=25)\nwhile motorC.duty_cycle is not 0:\n  pass\nmotorC.stop()\nmotorC.stop_command=\'hold\'\nmotorC.position=0\nmotorC.position_sp=-0.25*motorC.count_per_rot\nmotorC.run_to_abs_pos(duty_cycle_sp=-25)\nwhile motorC.duty_cycle is not 0:\n  pass\nmotorC.stop()';
  return code;
};

Blockly.Python['closeright'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorC.stop_command=\'hold\'\nmotorC.position=0\nmotorC.position_sp=-0.25*motorC.count_per_rot\nmotorC.run_to_abs_pos(duty_cycle_sp=-25)\nwhile motorC.duty_cycle is not 0:\n  pass\nmotorC.stop()\nmotorC.stop_command=\'hold\'\nmotorC.position=0\nmotorC.position_sp=0.25*motorC.count_per_rot\nmotorC.run_to_abs_pos(duty_cycle_sp=25)\nwhile motorC.duty_cycle is not 0:\n  pass\nmotorC.stop()';
  return code;
};

Blockly.Python['farleft'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorC.stop_command=\'hold\'\nmotorC.position=0\nmotorC.position_sp=0.25*motorC.count_per_rot\nmotorC.run_to_abs_pos(duty_cycle_sp=75)\nwhile motorC.duty_cycle is not 0:\n  pass\nmotorC.stop()\nmotorC.stop_command=\'hold\'\nmotorC.position=0\nmotorC.position_sp=-0.25*motorC.count_per_rot\nmotorC.run_to_abs_pos(duty_cycle_sp=-75)\nwhile motorC.duty_cycle is not 0:\n  pass\nmotorC.stop()';
  return code;
};

Blockly.Python['farright'] = function(block) {
  var code='';
  //code = 'e = motor.list_motors()\n';
  code = 'motorC.stop_command=\'hold\'\nmotorC.position=0\nmotorC.position_sp=-0.25*motorC.count_per_rot\nmotorC.run_to_abs_pos(duty_cycle_sp=-75)\nwhile motorC.duty_cycle is not 0:\n  pass\nmotorC.stop()\nmotorC.stop_command=\'hold\'\nmotorC.position=0\nmotorC.position_sp=0.25*motorC.count_per_rot\nmotorC.run_to_abs_pos(duty_cycle_sp=75)\nwhile motorC.duty_cycle is not 0:\n  pass\nmotorC.stop()';
  return code;
};