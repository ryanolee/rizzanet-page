const particles=[];
const particle_speed=0.001;
const max_particles=1000;
const particle_size=20;
const speed_limit=100;
const WIDTH=1920;
const HEIGHT=1080;
const dampening_factor=0.4;
const chaos=0.1;
const line_thickness=20;

const color_velocity=0.2;
const color_rating_alt=0;
const particles_paused=false;
//Force correction to slowdown on axis for target
const force_correction_to_target = 0.95;

let tick = 0



function setup() {
	createCanvas(WIDTH, HEIGHT);
	background(200,200,200);
	frameRate(60);
	strokeWeight(line_thickness);
	gen_particles(max_particles);
	
	load_target('./img/rizza.bmp');
}

function draw() {
	clear();
	if(!particles_paused){
		tick++

		for(i=0;i<particles.length;i++){
			particles[i].draw();
			particles[i].update();
			particles[i].update_velocity();
		}

		if(tick % 5 === 0){
			//console.log(mouseX, mouseY)
			let targets = get_targets_in_radius(mouseX,mouseY,200)

			for(i=0;i<targets.length;i++){
				targets[i].xv -= (mouseX - targets[i].x) * 0.01
				targets[i].yv -= (mouseY - targets[i].y) * 0.01
			}
		}
	}
}

/* EXPLODE AND IMPLODE */
function get_targets_in_radius(x,y,rad){
	rad=rad||200;
	open_set=[];
	for(i=0;i<particles.length;i++){
		if(pythag_dist(particles[i].x,x,particles[i].y,y)<rad){
			open_set.push(particles[i]);
		}
	}
	return open_set;
}

function pythag_dist(x1,x2,y1,y2){
	return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))
}

function explode(x,y,rad,power){
	open_set=get_targets_in_radius(x,y,rad);
	for(i=0;i<open_set.length;i++){
		dist_part=pythag_dist(open_set[i].x,x,open_set[i].y,y);
		open_set[i].xv=(open_set[i].x-x)*power*(1/dist_part);
		open_set[i].yv=(open_set[i].y-y)*power*(1/dist_part);
	}
}

function mousePressed(){
	if (mouseButton===LEFT){
		explode(mouseX,mouseY,300,100)
	}
	else if(mouseButton===RIGHT){
		explode(mouseX,mouseY,300,-100)
	}
}

/* EXPLODE AND IMPLODE END*/
function gen_particles(){
	for(i=0;i<max_particles;i++){
		particles.push(new particle(random(width),random(height),0,0));
	}
}

function convert_cords(x,y,x_total,y_total){
	return [round((x/x_total)*width),round((y/y_total)*height)];
}

function load_target(target_img_url){
	var myImg = new Image();
	myImg.src = target_img_url;
	myImg.onload = function() { 
		document.getElementById('hidden_target_image').width=myImg.width;
		document.getElementById('hidden_target_image').height=myImg.height;
		var context = document.getElementById('hidden_target_image').getContext('2d');
		context.drawImage(myImg, 0, 0);
		data_orig=context.getImageData(0, 0, myImg.width, myImg.height).data;
		fourths=[];
		data=[];
		for(i=0;i<data_orig.length;i+=4){//Remove RGBA color encoding
			fourths.push(data_orig[i]);
		}
		delete data_orig;
		for(i=0;i<myImg.height;i++){
			data.push(fourths.slice(i*myImg.width,(i+1)*myImg.width));
		}
		delete fourths;
		valid_points=[];
		for(y=0;y<data.length;y++){
				for(x=0;x<data[0].length;x++){
					if(data[y][x]==0){
						valid_points.push(convert_cords(x,y,myImg.width,myImg.height));//convert_cords(x,y,myImg.width,myImg.height));
					}
				}
		}
		delete data;
		
		for(i=0;i<particles.length;i++){
			selected=valid_points[round((valid_points.length/particles.length) * i)];
			particles[i].t_x=selected[0];
			particles[i].t_y=selected[1];
			//Force strait line travel
			particles[i].xv=(selected[0]-particles[i].x)/30;
			particles[i].yv=(selected[1]-particles[i].y)/30;
			particles[i].speed=1;
		}
	}
}
function particle(x,y,xv,yv){
	this.x=x||0
	this.y=y||0
	this.xv=xv||0
	this.yv=yv||0
	this.t_x=0
	this.t_y=0
	this.speed=1
	this.chaos=0
	this.draw=function(){
		//stroke(particle_size);
		//rectMode(CENTER);
		//rect(this.x,this.y, 10, 10);
		//circle(this.x,this.y, 20);
		//box(10);
		line(this.x,this.y,this.x+(this.xv*this.speed),this.y+(this.yv*this.speed))
	}
	this.update=function(){
		this.x+=this.xv*this.speed;
		this.y+=this.yv*this.speed;
	}
	this.go_towards_target=function(t_x,t_y){
		if(abs(this.x-t_x)>3){
			if(t_x>this.x){
				this.xv+=particle_speed*abs(t_x-this.x)+this.chaos;
			}
			else{
				this.xv-=particle_speed*abs(t_x-this.x)+this.chaos;
			}
		}
		if(this.x>WIDTH || this.x<0){
			if(abs(this.xv*dampening_factor)<1){
				this.xv=(abs(this.xv)/this.xv)*-1;
			}
			else{
				this.xv*=-dampening_factor;
			}
			if(abs(this.x-HEIGHT)>abs(this.x)){
				this.x=1
			}
			else{
				this.x=WIDTH
			}
		}
		if(abs(this.y-t_y)>3){
			if(t_y>this.y){
				this.yv+=particle_speed*abs(t_y-this.y)+this.chaos;
			}
			else{
				 this.yv-=(particle_speed*abs(t_y-this.y))+this.chaos;
			}
		}
		if(this.y>HEIGHT || this.y<0){
			if(abs(this.yv*dampening_factor)<1){
				this.yv=(abs(this.yv)/this.yv)*-1;
			}
			else{
				this.yv*=-dampening_factor;
			}
			if(abs(this.y-HEIGHT)>abs(this.y)){
				this.y=1
			}
			else{
				this.y=HEIGHT
			}
		}
		if(this.speed!=0){
			//this.speed=(Math.sqrt(Math.pow(abs(this.x-t_x),2)+Math.pow(abs(this.y-t_y),2)))/(width*1.5);
			if(this.speed<0.1){
				this.speed=0.1;
			}

			//Apply slowing force when on correct axis
			let dx = abs(this.x-t_x)
			let dy = abs(this.x-t_x)
			/*if(dx < 10){
				this.xv *= force_correction_to_target

			}
			if(dy < 10){
				this.yv *= force_correction_to_target
			}*/

			if(dx < 100 && dy < 100){
				this.yv = min(this.yv * force_correction_to_target, 10)
				this.xv = min(this.xv * force_correction_to_target, 10)
			}

			
		}
	}
	this.update_velocity=function(){
		this.go_towards_target(this.t_x,this.t_y);
	}
}